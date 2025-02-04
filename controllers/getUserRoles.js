exports.getUserRoles = async (req, res) => {
    try {
        const { id } = req.params;

        const userRoles = await UserRoles.findAll({
            where: { user_id: id },
            include: [{ model: Roles, attributes: ['name', 'description'] }],
        });

        res.status(200).json(userRoles);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error });
    }
};
