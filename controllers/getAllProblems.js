exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problems.findAll();
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера.', error });
    }
};
