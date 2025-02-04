// ../controllers/budgetController.js

// ��������� ��� ������ � ����� �����
const Budget = require('../models/Budget'); // ������ ��� ������ � ���������
const Project = require('../models/Project'); // ������ ��� ������ � ���������

// �������� ������
const createBudget = async (req, res) => {
  try {
    const { projectId, amount, description } = req.body;

    // �������� �����
    if (!projectId || !amount || !description) {
      return res.status(400).json({ message: '�� ���� � ������������.' });
    }

    // ���������, �� ���� ������
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: '������ �� ��������.' });
    }

    const budget = await Budget.create({ projectId, amount, description });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

// �������� ������� �������
const getProjectBudgets = async (req, res) => {
  try {
    const { project_id } = req.params;

    // ���������, �� ���� ������
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: '������ �� ��������.' });
    }

    const budgets = await Budget.findAll({ where: { projectId: project_id } });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

// ������� ������
const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    // ������ ������ �� ID
    co
