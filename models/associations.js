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
        OrderItem,
    } = db;

    // 사용자와 QnA(1:N) - 사용자 삭제 시 QnA의 UserID를 NULL로 설정
    User.hasMany(QnA, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'SET NULL',
    });

    QnA.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
        onDelete: 'SET NULL',
    });

    // 상품과 QnA(1:N) - 상품이 삭제되면 관련 QnA도 삭제
    Products.hasMany(QnA, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    QnA.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    // QnA와 QnA 답변(1:N) - QnA가 삭제되면 관련 답변도 삭제
    QnA.hasMany(QnAReplies, {
        foreignKey: 'QnAID',
        sourceKey: 'QnAID',
        onDelete: 'CASCADE',
    });

    QnAReplies.belongsTo(QnA, {
        foreignKey: 'QnAID',
        targetKey: 'QnAID',
    });

    // 상품과 QnA 답변(1:N) - 상품이 삭제되면 관련 QnA 답변도 삭제
    Products.hasMany(QnAReplies, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    QnAReplies.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    // 사용자와 문의(1:N) - 사용자 삭제 시 문의의 UserID를 NULL로 설정
    User.hasMany(Inquiries, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'SET NULL',
    });

    Inquiries.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
        onDelete: 'SET NULL',
    });

    // 문의와 문의 답변(1:N) - 문의가 삭제되면 관련 답변도 삭제
    Inquiries.hasMany(InquiryReplies, {
        foreignKey: 'InquiryID',
        sourceKey: 'InquiryID',
        onDelete: 'CASCADE',
    });

    InquiryReplies.belongsTo(Inquiries, {
        foreignKey: 'InquiryID',
        targetKey: 'InquiryID',
    });

    // 사용자와 주문 목록(1:N) - 사용자가 삭제되면 관련 주문도 삭제
    User.hasMany(OrderList, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    OrderList.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 주문 목록과 주문 아이템(1:N) - 주문이 삭제되면 관련 주문 아이템도 삭제
    OrderList.hasMany(OrderItem, {
        foreignKey: 'OrderListID',
        sourceKey: 'OrderListID',
        onDelete: 'CASCADE',
    });

    OrderItem.belongsTo(OrderList, {
        foreignKey: 'OrderListID',
        targetKey: 'OrderListID',
    });

    // 상품과 주문 아이템(1:N) - 상품이 삭제되면 관련 주문 아이템도 삭제
    Products.hasMany(OrderItem, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    OrderItem.belongsTo(db.Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    // 주문 목록과 장바구니(1:N) - 주문이 삭제되면 관련 장바구니도 삭제
    OrderList.hasMany(Cart, {
        foreignKey: 'OrderListID',
        sourceKey: 'OrderListID',
        onDelete: 'CASCADE',
    });

    Cart.belongsTo(OrderList, {
        foreignKey: 'OrderListID',
        targetKey: 'OrderListID',
    });

    // 상품과 장바구니(1:N) - 상품이 삭제되면 관련 장바구니도 삭제
    Products.hasMany(Cart, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    Cart.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });

    // 사용자와 트랜잭션(1:N) - 사용자가 삭제되면 관련 트랜잭션도 삭제
    User.hasMany(Transactions, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 주문 목록과 트랜잭션(1:1) - 주문이 삭제되면 관련 트랜잭션도 삭제
    OrderList.hasOne(Transactions, {
        foreignKey: 'OrderListID',
        sourceKey: 'OrderListID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(OrderList, {
        foreignKey: 'OrderListID',
        targetKey: 'OrderListID',
    });

    // Points 모델에서 User 모델과의 관계 설정
    Points.belongsTo(User, {
        foreignKey: 'UserID', // Points 테이블의 UserID를 외래키로 설정
        targetKey: 'UserID', // User 테이블의 기본 키 UserID를 참조
        as: 'PointUser', // Alias 설정
    });

    // User 모델에서 Points 모델과의 관계 설정
    User.hasMany(Points, {
        foreignKey: 'UserID', // Points 모델에서 참조할 외래키
        sourceKey: 'UserID', // User 테이블의 기본 키 UserID를 참조
        as: 'UserPoints', // Alias 설정
        onDelete: 'CASCADE', // User 삭제 시 관련 Points 레코드 삭제
    });

    // 트랜잭션과 포인트(1:N) - 트랜잭션이 삭제되면 관련 포인트도 삭제
    Transactions.hasMany(Points, {
        foreignKey: 'TransactionID',
        sourceKey: 'TransactionID',
        onDelete: 'CASCADE',
    });

    Points.belongsTo(Transactions, {
        foreignKey: 'TransactionID',
        targetKey: 'TransactionID',
    });

    // UserCoupon과 User의 관계에서 LoginID에 접근할 수 있도록 설정
    User.hasMany(UserCoupon, {
        foreignKey: 'UserID', // UserCoupon의 외래 키는 UserID
        sourceKey: 'UserID',
        as: 'Coupons', // User와 UserCoupon 간의 관계 alias
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
        as: 'UserDetail', // UserCoupon에서 User의 LoginID를 참조할 때 사용할 alias
    });

    // 쿠폰과 사용자 쿠폰(1:N) - 쿠폰이 삭제되면 관련 사용자 쿠폰도 삭제
    Coupons.hasMany(UserCoupon, {
        foreignKey: 'CouponID',
        sourceKey: 'CouponID',
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(Coupons, {
        foreignKey: 'CouponID',
        targetKey: 'CouponID',
    });

    // 상품과 카테고리(1:N) - 카테고리가 삭제되면 관련 상품도 삭제
    Categories.hasMany(Products, {
        foreignKey: 'CategoryID',
        sourceKey: 'CategoryID',
        onDelete: 'CASCADE',
    });

    Products.belongsTo(Categories, {
        foreignKey: 'CategoryID',
        targetKey: 'CategoryID',
    });

    // 관리자와 공지사항(1:N) - 관리자가 삭제되면 관련 공지사항도 삭제
    Admin.hasMany(Notice, {
        foreignKey: 'AdminID',
        sourceKey: 'AdminID',
        onDelete: 'CASCADE',
    });

    Notice.belongsTo(Admin, {
        foreignKey: 'AdminID',
        targetKey: 'AdminID',
    });

    // 사용자와 리뷰(1:N) - 사용자가 삭제되면 관련 리뷰도 삭제
    User.hasMany(Reviews, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Reviews.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    // 상품과 리뷰(1:N) - 상품이 삭제되면 관련 리뷰도 삭제
    Products.hasMany(Reviews, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    Reviews.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });

    // 상품과 주문 목록(1:N) - 상품이 삭제되면 관련 주문도 삭제

    Products.hasMany(OrderList, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    OrderList.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });
};

module.exports = applyAssociations;
