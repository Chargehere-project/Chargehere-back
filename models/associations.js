const applyAssociations = (db) => {
    const {
        User,
        Inquiries,
        InquiryReplies,
        Products,
        OrderList,
        Cart,
        Transactions,
        Points,
        Coupons,
        UserCoupon,
        Categories,
        Admin,
        Banner,
        Notice,
        Reviews,
        QnA,
        QnAReplies,
    } = db;

    // 사용자와 문의(1:N) - ON DELETE SET NULL 적용
    User.hasMany(Inquiries, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'SET NULL', // 사용자 삭제 시 UserID를 NULL로 설정
    });

    Inquiries.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
        onDelete: 'SET NULL', // 사용자 삭제 시 UserID를 NULL로 설정
    });

    // 문의와 문의 답변(1:N)
    Inquiries.hasMany(InquiryReplies, {
        foreignKey: 'InquiryID',
        sourceKey: 'InquiryID',
        onDelete: 'CASCADE',
    });

    InquiryReplies.belongsTo(Inquiries, {
        foreignKey: 'InquiryID',
        targetKey: 'InquiryID',
    });

    // 사용자와 QnA(1:N) - ON DELETE SET NULL 적용
    User.hasMany(QnA, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'SET NULL', // 사용자 삭제 시 UserID를 NULL로 설정
    });

    QnA.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
        onDelete: 'SET NULL', // 사용자 삭제 시 UserID를 NULL로 설정
    });

    // QnA와 QnA 답변(1:N)
    QnA.hasMany(QnAReplies, {
        foreignKey: 'QnAID',
        sourceKey: 'QnAID',
        onDelete: 'CASCADE',
    });

    QnAReplies.belongsTo(QnA, {
        foreignKey: 'QnAID',
        targetKey: 'QnAID',
    });

    // 사용자와 주문 목록(1:N)
    User.hasMany(OrderList, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    OrderList.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 주문 목록과 장바구니(1:N)
    OrderList.hasMany(Cart, {
        foreignKey: 'OrderListID',
        sourceKey: 'OrderListID',
        onDelete: 'CASCADE',
    });

    Cart.belongsTo(OrderList, {
        foreignKey: 'OrderListID',
        targetKey: 'OrderListID',
    });

    // 상품과 장바구니(1:N)
    Products.hasMany(Cart, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    Cart.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });

    // 사용자와 트랜잭션(1:N)
    User.hasMany(Transactions, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 주문 목록과 트랜잭션(1:1)
    OrderList.hasOne(Transactions, {
        foreignKey: 'OrderListID',
        sourceKey: 'OrderListID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(OrderList, {
        foreignKey: 'OrderListID',
        targetKey: 'OrderListID',
    });

    // 사용자와 포인트(1:N)
    User.hasMany(Points, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        as: 'UserPoints', // 관계에서 'UserPoints'라는 별칭 사용
        onDelete: 'CASCADE',
    });

    Points.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 트랜잭션과 포인트(1:N)
    Transactions.hasMany(Points, {
        foreignKey: 'TransactionID',
        sourceKey: 'TransactionID',
        onDelete: 'CASCADE',
    });

    Points.belongsTo(Transactions, {
        foreignKey: 'TransactionID',
        targetKey: 'TransactionID',
    });

    // 사용자와 쿠폰(1:N)
    User.hasMany(UserCoupon, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 쿠폰과 사용자 쿠폰(1:N)
    Coupons.hasMany(UserCoupon, {
        foreignKey: 'CouponID',
        sourceKey: 'CouponID',
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(Coupons, {
        foreignKey: 'CouponID',
        targetKey: 'CouponID',
    });

    // 상품과 카테고리(1:N)
    Categories.hasMany(Products, {
        foreignKey: 'CategoryID',
        sourceKey: 'CategoryID',
        onDelete: 'CASCADE',
    });

    Products.belongsTo(Categories, {
        foreignKey: 'CategoryID',
        targetKey: 'CategoryID',
    });

    // 관리자와 공지사항(1:N)
    Admin.hasMany(Notice, {
        foreignKey: 'AdminID',
        sourceKey: 'AdminID',
        onDelete: 'CASCADE',
    });

    Notice.belongsTo(Admin, {
        foreignKey: 'AdminID',
        targetKey: 'AdminID',
    });

    // 관리자와 배너(1:N)
    Admin.hasMany(Banner, {
        foreignKey: 'AdminID',
        sourceKey: 'AdminID',
        onDelete: 'CASCADE',
    });

    Banner.belongsTo(Admin, {
        foreignKey: 'AdminID',
        targetKey: 'AdminID',
    });

    // 사용자와 리뷰(1:N)
    User.hasMany(Reviews, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Reviews.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 상품과 리뷰(1:N)
    Products.hasMany(Reviews, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    Reviews.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });
};

module.exports = applyAssociations;
