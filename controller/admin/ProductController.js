// controller/admin/ProductController.js
const { Products } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 상품 목록 조회 기능 - 페이지네이션 적용
const getProducts = async (req, res) => {
    const { page = 1, limit = 10, name, status, categoryId } = req.query; // 페이지, 제한 수, 이름, 상태, 카테고리ID 필터를 쿼리에서 가져옵니다.
    const offset = (page - 1) * limit;

    // where 조건을 초기화합니다.
    let whereCondition = {};

    // 상품명으로 검색
    if (name) {
        whereCondition.ProductName = { [Op.like]: `%${name}%` };
    }

    // 상태 필터링 (active, inactive, deleted 등)
    if (status) {
        whereCondition.Status = status;
    }

    // 카테고리 ID 필터링
    if (categoryId) {
        whereCondition.CategoryID = categoryId;
    }

    try {
        // 상품 목록과 전체 개수를 조회합니다.
        const { count, rows } = await Products.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']], // 최신순 정렬
        });

        const totalPages = Math.ceil(count / limit); // 전체 페이지 수 계산

        res.json({
            products: rows, // 현재 페이지의 상품 목록
            totalPages, // 전체 페이지 수
            currentPage: parseInt(page), // 현재 페이지
            totalCount: count, // 전체 상품 수 추가
        });
    } catch (error) {
        console.error('상품 목록 조회 실패:', error.message);
        res.status(500).json({ message: '상품 목록 조회 실패', error: error.message });
    }
};


// 상품 등록
const createProduct = async (req, res) => {
    const { name, price, discountRate, description, status, categoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // 파일이 있을 경우 경로 지정

    try {
        const newProduct = await Products.create({
            ProductName: name,
            Price: price,
            Discount: discountRate,
            Image: image, // 이미지 경로 설정
            DetailInfo: description,
            CategoryID: categoryId,
            Status: status || 'active', // 기본 상태는 'active'
        });
        res.json({ message: '상품이 성공적으로 등록되었습니다.', product: newProduct });
    } catch (error) {
        console.error('상품 등록 실패:', error);
        res.status(500).json({ message: '상품 등록에 실패했습니다.', error });
    }
};


// 상품 수정
const editProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, price, discountRate, description, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.ProductName = name;
        product.Price = price;
        product.Discount = discountRate;
        product.DetailInfo = description;
        product.Status = status;

        // 이미지가 새로 업로드된 경우에만 업데이트
        if (image) {
            product.Image = image;
        }

        await product.save();
        res.json({ message: '상품이 성공적으로 수정되었습니다.', product });
    } catch (error) {
        console.error('상품 수정 실패:', error);
        res.status(500).json({ message: '상품 수정에 실패했습니다.', error });
    }
};






// 상품 삭제
const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.Status = 'deleted'; // '삭제됨' 상태로 변경
        await product.save();

        res.json({ message: '상품이 삭제되었습니다.', product });
    } catch (error) {
        console.error('상품 삭제 실패:', error);
        res.status(500).json({ message: '상품 삭제에 실패했습니다.', error });
    }
};

// 상태 변경
const updateProductStatus = async (req, res) => {
    const { productId } = req.params;
    const { status } = req.body;

    console.log(`상태 변경 요청 - ProductID: ${productId}, Status: ${status}`); // 디버깅 코드

    try {
        const product = await Products.findByPk(productId);
        if (!product) {
            console.log('상품을 찾을 수 없습니다.');
            return res.status(404).json({ message: '해당 상품을 찾을 수 없습니다.' });
        }

        product.Status = status;
        await product.save();

        console.log('상태가 성공적으로 변경되었습니다:', product.Status); // 디버깅 코드
        res.json({ message: '상태가 성공적으로 변경되었습니다.', product });
    } catch (error) {
        console.error('상태 변경 실패:', error); // 디버깅 코드
        res.status(500).json({ message: '상태 변경에 실패했습니다.', error });
    }
};

// 상품 이미지 삭제 함수
const deleteProductImage = async (req, res) => {
    console.log('deleteProductImage 함수 호출됨:', req.params.productId);
    try {
        const { productId } = req.params;
        const product = await Products.findByPk(productId);

        if (!product || !product.Image) {
            return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
        }

        // 경로 수정: 중복된 uploads 폴더 제거
        const imagePath = path.join(__dirname, '../../uploads', product.Image.replace('/uploads/', ''));

        // 파일 삭제
        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('파일 삭제 실패:', err);
                return res.status(500).json({ message: '이미지 삭제에 실패했습니다.' });
            }

            // DB에서 이미지 경로 제거
            product.Image = null;
            await product.save();

            res.json({ message: '이미지가 성공적으로 삭제되었습니다.' });
        });
    } catch (error) {
        console.error('이미지 삭제 오류:', error);
        if (!res.headersSent) { // 이미 응답을 보냈는지 확인
            res.status(500).json({ message: '이미지 삭제 오류가 발생했습니다.' });
        }
    }
};

// const convertToKST = (utcDate) => {
//     const date = new Date(utcDate);
//     date.setHours(date.getHours() + 9); // UTC에서 KST로 변환
//     return date.toISOString().replace('T', ' ').substring(0, 19);
// };

const searchProducts = async (req, res) => {
    const { productId, name, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const whereCondition = {};

    // 기본 검색 조건을 '상품 이름'으로 설정
    if (name || (!productId && !name)) {
        whereCondition.ProductName = { [Op.like]: `%${name || ''}%` };
        console.log('상품 이름 검색 조건 적용:', whereCondition.ProductName);
    }

    // 상품 ID 검색 조건 추가
    if (productId) {
        whereCondition.ProductID = { [Op.like]: `%${productId}%` };
        console.log('상품 ID 검색 조건 적용:', whereCondition.ProductID);
    }

    // 상태 필터 추가
    if (status) {
        whereCondition.Status = status;
        console.log('상태 필터 적용:', whereCondition.Status);
    }

    // 기간 필터 추가 (createdAt 기준)
    if (startDate && endDate) {
        whereCondition.createdAt = {
            [Op.between]: [moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate()],
        };
        console.log('기간 필터 조건 적용:', whereCondition.createdAt);
    }

    try {
        const offset = (page - 1) * limit;
        const { rows: products, count } = await Products.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        const formattedProducts = products.map((product) => ({
            ...product.toJSON(),
            createdAt: moment(product.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        }));

        console.log('검색된 상품 목록:', formattedProducts); // 검색 결과 확인

        res.json({
            products: formattedProducts,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error('상품 검색 실패:', error);
        res.status(500).json({ message: '상품 검색 실패', error });
    }
};

module.exports = {
    getProducts,
    createProduct,
    editProduct,
    deleteProduct,
    updateProductStatus,
    deleteProductImage,
    searchProducts,
};
