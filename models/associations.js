const applyAssociations = (db) => {
    const { User, Inquiries, InquiryReplies } = db;

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
};

module.exports = applyAssociations;
