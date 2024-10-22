const applyAssociations = (db) => {
    const {
        User,
        Inquiries,
        InquiryReplies,
        Products,
        Orders,
        OrderItems,
        Transactions,
        Points,
        Coupons,
        UserCoupon,
        Categories,
        Admin,
        Banner,
        Notice,
        Reviews,
    } = db;

    // 기존 관계 설정
    User.hasMany(Inquiries, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Inquiries.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    Inquiries.hasMany(InquiryReplies, {
        foreignKey: 'InquiryID',
        sourceKey: 'InquiryID',
        onDelete: 'CASCADE',
    });

    InquiryReplies.belongsTo(Inquiries, {
        foreignKey: 'InquiryID',
        targetKey: 'InquiryID',
    });

    User.hasMany(Orders, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Orders.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    Orders.hasMany(OrderItems, {
        foreignKey: 'OrderID',
        sourceKey: 'OrderID',
        onDelete: 'CASCADE',
    });

    OrderItems.belongsTo(Orders, {
        foreignKey: 'OrderID',
        targetKey: 'OrderID',
    });

    Products.hasMany(OrderItems, {
        foreignKey: 'ProductID',
        sourceKey: 'ProductID',
        onDelete: 'CASCADE',
    });

    OrderItems.belongsTo(Products, {
        foreignKey: 'ProductID',
        targetKey: 'ProductID',
    });

    User.hasMany(Transactions, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    Orders.hasOne(Transactions, {
        foreignKey: 'OrderID',
        sourceKey: 'OrderID',
        onDelete: 'CASCADE',
    });

    Transactions.belongsTo(Orders, {
        foreignKey: 'OrderID',
        targetKey: 'OrderID',
    });

    // 변경된 관계 설정: User와 Points 간의 충돌 방지
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

    Transactions.hasMany(Points, {
        foreignKey: 'TransactionID',
        sourceKey: 'TransactionID',
        onDelete: 'CASCADE',
    });

    Points.belongsTo(Transactions, {
        foreignKey: 'TransactionID',
        targetKey: 'TransactionID',
    });

    User.hasMany(UserCoupon, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

    Coupons.hasMany(UserCoupon, {
        foreignKey: 'CouponID',
        sourceKey: 'CouponID',
        onDelete: 'CASCADE',
    });

    UserCoupon.belongsTo(Coupons, {
        foreignKey: 'CouponID',
        targetKey: 'CouponID',
    });

    // Products와 Categories의 관계 (1:N)
    Categories.hasMany(Products, {
        foreignKey: 'CategoryID',
        sourceKey: 'CategoryID',
        onDelete: 'CASCADE',
    });

    Products.belongsTo(Categories, {
        foreignKey: 'CategoryID',
        targetKey: 'CategoryID',
    });

    // Admin과 Notice의 관계 (1:N)
    Admin.hasMany(Notice, {
        foreignKey: 'AdminID',
        sourceKey: 'AdminID',
        onDelete: 'CASCADE',
    });

    Notice.belongsTo(Admin, {
        foreignKey: 'AdminID',
        targetKey: 'AdminID',
    });

    // Admin과 Banner의 관계 (1:N)
    Admin.hasMany(Banner, {
        foreignKey: 'AdminID',
        sourceKey: 'AdminID',
        onDelete: 'CASCADE',
    });

    Banner.belongsTo(Admin, {
        foreignKey: 'AdminID',
        targetKey: 'AdminID',
    });

    User.hasMany(Reviews, {
        foreignKey: 'UserID',
        sourceKey: 'UserID',
        onDelete: 'CASCADE',
    });

    Reviews.belongsTo(User, {
        foreignKey: 'UserID',
        targetKey: 'UserID',
    });

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