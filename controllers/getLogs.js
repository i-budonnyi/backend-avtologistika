exports.getLogs = async (req, res) => {
    try {
        const logs = await PmLogs.findAll();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
