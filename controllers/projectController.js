// ../controllers/projectController.js

// ��������� ��� ������ � ����� �����
const Project = require('../models/Project'); // ������ ��� ������ � ���������

// �������� ����� ������
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, budget } = req.body;

    // �������� �����
    if (!name || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: '�� ���� � ������������.' });
    }

    const project = await Project.create({ name, description, startDate, endDate, budget });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

// �������� ������ �������
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll(); // �������������� ��� ORM ��� SQL-�����
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

// ������� ������
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, budget } = req.body;

    const project = await Project.findByPk(id); // ������ ������ �� ID
    if (!project) {
      return res.status(404).json({ message: '������ �� ��������.' });
    }

    // ��������� ����
    project.name = name || project.name;
    project.description = description || project.description;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.budget = budget || project.budget;

    await project.save(); // �������� ����
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

// �������� ������
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id); // ������ ������ �� ID
    if (!project) {
      return res.status(404).json({ message: '������ �� ��������.' });
    }

    await project.destroy(); // �������� ������
    res.status(200).json({ message: '������ ������ ��������.' });
  } catch (error) {
    res.status(500).json({ message: '������� �������.', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
