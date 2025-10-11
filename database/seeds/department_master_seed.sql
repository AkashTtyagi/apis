-- =====================================================
-- HRMS Department Master Seed Data
-- Converted from km_department_master to hrms_department_master
-- =====================================================

-- Note: This file contains seed data for department master table
-- Run this after creating the tables

-- Generic Departments (industry_id = NULL means applicable to all industries)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, department_code, is_active) VALUES
(1, NULL, 'Admin', 'ADMIN', 1),
(2, NULL, 'Finance', 'FINANCE', 1),
(3, NULL, 'HR', 'HR', 1),
(4, NULL, 'Legal', 'LEGAL', 0),
(5, NULL, 'Management', 'MGMT', 1),
(6, NULL, 'Marketing', 'MARKETING', 1),
(7, NULL, 'Operations', 'OPS', 0),
(8, NULL, 'Product', 'PRODUCT', 1),
(9, NULL, 'Sales', 'SALES', 1),
(10, NULL, 'Vendor Management', 'VENDOR', 0);

-- Industry ID 35 Departments (Manufacturing/Production Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(11, 35, 'HR', 1),
(12, 35, 'Finance', 1),
(13, 35, 'Management', 1),
(14, 35, 'Admin', 1),
(15, 35, 'Operation', 1),
(16, 35, 'Technical', 1),
(17, 35, 'Functional', 1),
(18, 35, 'Accounts', 1),
(19, 35, 'Sales and Marketing', 1),
(20, 35, 'Quality Assurance', 1),
(21, 35, 'Design', 1),
(22, 35, 'Supply Chain', 1),
(23, 35, 'Law and Financial dept', 1),
(24, 35, 'Support Services', 1),
(25, 35, 'IT', 1),
(26, 35, 'Production Engineering Dept', 1),
(27, 35, 'Research & Development', 1),
(28, 35, 'Risk Management Dept', 1),
(29, 35, 'Logistic Dept', 1),
(30, 35, 'Production Dept', 1),
(31, 35, 'Administration Dept', 1),
(32, 35, 'Environmental Safety & Hygiene', 1),
(33, 35, 'Purchasing', 1),
(34, 35, 'EDP', 1),
(35, 35, 'Research & analysis', 1);

-- Industry ID 18 Departments (Warehouse/Logistics Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(36, 18, 'HR', 1),
(37, 18, 'Finance', 1),
(38, 18, 'Management', 1),
(39, 18, 'Admin', 1),
(40, 18, 'Operation', 1),
(41, 18, 'Technical', 1),
(42, 18, 'Functional', 1),
(43, 18, 'Accounts', 1),
(44, 18, 'Quality Assurance', 1),
(45, 18, 'Law and Financial dept', 1),
(46, 18, 'Supply Chain', 1),
(47, 18, 'Warehouse', 1),
(48, 18, 'Shipping', 1),
(49, 18, 'Support Services', 1),
(50, 18, 'IT', 1),
(51, 18, 'Production Engineering Dept.', 1),
(52, 18, 'Research & Development', 1),
(53, 18, 'Risk Management Dept', 1),
(54, 18, 'Logistic Dept', 1),
(55, 18, 'Production Dept', 1),
(56, 18, 'Administration Dept', 1),
(57, 18, 'Environmental Safety & Hygiene', 1),
(58, 18, 'Purchasing', 1),
(59, 18, 'EDP', 1),
(60, 18, 'Store', 1);

-- Industry ID 36 Departments (Banking Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(61, 36, 'Management', 1),
(62, 36, 'Admin', 1),
(63, 36, 'Planning & Development', 1),
(64, 36, 'General Administration', 1),
(65, 36, 'Personal Banking & Operations', 1),
(66, 36, 'Digital Banking Department', 1),
(67, 36, 'Retail Banking & Marketing Department', 1),
(68, 36, 'Wealth Management & Third Party Products', 1),
(69, 36, 'International Banking Division & DFB', 1),
(70, 36, 'Treasury', 1),
(71, 36, 'Information Technology', 1),
(72, 36, 'Support Services & Branch Expansion', 1),
(73, 36, 'Large Corporate & Loan Syndication', 1),
(74, 36, 'MSME (Micro Small & Medium Enterprises)', 1),
(75, 36, 'Rural & Agri Business', 1),
(76, 36, 'Financial Inclusion', 1),
(77, 36, 'Law Department', 1),
(78, 36, 'Credit Recovery Department', 1),
(79, 36, 'Risk Management Department', 1),
(80, 36, 'Central Audit & Inspection Department', 1),
(81, 36, 'Compliance Department', 1),
(82, 36, 'Central Accounts & FPIR', 1),
(83, 36, 'Foreign Exchange Dept', 1),
(84, 36, 'Pension Reforms and Insurance', 1),
(85, 36, 'Economic Adviser –I', 1);

-- Industry ID 12 Departments (Healthcare/Education Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(86, 12, 'Administration', 1),
(87, 12, 'Anaestheisa', 1),
(88, 12, 'Anatomy', 1),
(89, 12, 'Applied Science & Humanities', 1),
(90, 12, 'Computer Science and Engineering', 1),
(91, 12, 'Conservative Dentistry', 1),
(92, 12, 'Corporate Resource Centre', 1),
(93, 12, 'Finance & Accounts', 1),
(94, 12, 'General Medicine', 1),
(95, 12, 'General Surgery', 1),
(96, 12, 'Information Technology', 1),
(97, 12, 'Library', 1),
(98, 12, 'Maintenance', 1),
(99, 12, 'Management', 1),
(100, 12, 'Physiotherapy', 1),
(101, 12, 'Prosthodontics', 1),
(102, 12, 'Research & Development Centre', 1),
(103, 12, 'Pharmacy', 1),
(104, 12, 'Operations', 0),
(105, 12, 'Oral Surgery', 1),
(106, 12, 'Orthodontics', 1),
(107, 12, 'Pathology', 1),
(108, 12, 'Security', 1),
(109, 12, 'Store', 1),
(110, 12, 'Transport', 1);

-- Industry ID 26 Departments (Retail Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(111, 26, 'Finance & Accounts', 1),
(112, 26, 'Administration', 1),
(113, 26, 'Audit', 1),
(114, 26, 'Business Development', 1),
(115, 26, 'Crm', 1),
(116, 26, 'Designing', 1),
(117, 26, 'Director''s Office', 1),
(118, 26, 'Supply Chain', 1),
(119, 26, 'E-Commerce', 1),
(120, 26, 'Farming', 1),
(121, 26, 'HR', 1),
(122, 26, 'Information Technology', 1),
(123, 26, 'Legal', 0),
(124, 26, 'Marketing', 1),
(125, 26, 'Project', 1),
(126, 26, 'Retail Merchandise', 1),
(127, 26, 'Sales', 1),
(128, 26, 'Store', 1),
(129, 26, 'Visual Merchandise', 1),
(130, 26, 'Sourcing', 1),
(131, 26, 'Inventory Control', 1),
(132, 26, 'Sampling', 1),
(133, 26, 'Sales & Distribution', 1),
(134, 26, 'Production', 1),
(135, 26, 'Risk Management', 1);

-- Industry ID 8 Departments (Technology/E-commerce Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(136, 8, 'Management', 1),
(137, 8, 'Law & Finance', 1),
(138, 8, 'Accounts', 1),
(139, 8, 'B2B/B2C', 1),
(140, 8, 'Inside Sales', 1),
(141, 8, 'Procurement', 1),
(142, 8, 'Sales & Marketing', 1),
(143, 8, 'Development', 1),
(144, 8, 'Repair', 1),
(145, 8, 'Quality Assurance', 1),
(146, 8, 'Purchase and Store', 1),
(147, 8, 'Functional', 1),
(148, 8, 'Operation', 1),
(149, 8, 'Technical', 1),
(150, 8, 'Warehouse', 1),
(151, 8, 'Research & Development', 1),
(152, 8, 'Logistics', 1),
(153, 8, 'HR', 1),
(154, 8, 'Analyst', 1),
(155, 8, 'Risk Management', 1),
(156, 8, 'Product', 1),
(157, 8, 'IT', 1),
(158, 8, 'Customer Support', 1),
(159, 8, 'Admin', 1),
(160, 8, 'Pick & Delivery', 1);

-- Industry ID 34 Departments (Textile/Garment Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(161, 34, 'Production', 1),
(162, 34, 'Quality Control', 1),
(163, 34, 'Accounts', 1),
(164, 34, 'HR', 1),
(165, 34, 'Maintenance', 1),
(166, 34, 'Administration', 1),
(167, 34, 'Purchase & Store', 1),
(168, 34, 'Information Technology', 1),
(169, 34, 'Merchandising', 1),
(170, 34, 'Promotion', 1),
(171, 34, 'Sales', 1),
(172, 34, 'Admin', 1),
(173, 34, 'Operations', 0),
(174, 34, 'Law & Finance', 1),
(175, 34, 'Functional', 1),
(176, 34, 'Non Functional', 1),
(177, 34, 'Management', 1),
(178, 34, 'Support Services', 1),
(179, 34, 'Logistics', 1),
(180, 34, 'Implementare', 1),
(181, 34, 'Research & Development', 1),
(182, 34, 'Production Engineering Dept', 1),
(183, 34, 'Risk Management Dept', 1),
(184, 34, 'Environmental Safety & Hygiene', 1),
(185, 34, 'Store', 1);

-- Industry ID 9 Departments (Education/Training Industry)
INSERT INTO hrms_department_master (department_id, industry_id, department_name, is_active) VALUES
(186, 9, 'Learning Solutions', 1),
(187, 9, 'Advisor', 1),
(188, 9, 'HR', 1),
(189, 9, 'Information Technology', 1),
(190, 9, 'Administration', 1),
(191, 9, 'Librarian', 1),
(192, 9, 'Management', 1),
(193, 9, 'Counselor', 1),
(194, 9, 'Coordinator', 1),
(195, 9, 'Consultant', 1),
(196, 9, 'Accounts', 1),
(197, 9, 'Law and Finance', 1);

-- =====================================================
-- Summary:
-- Total Departments: 197
-- Generic Departments (NULL industry): 10
-- Industry-specific Departments: 187
--
-- Industry breakdown:
-- Industry 35: 25 departments
-- Industry 18: 25 departments
-- Industry 36: 25 departments (Banking)
-- Industry 12: 25 departments (Healthcare/Education)
-- Industry 26: 25 departments (Retail)
-- Industry 8: 25 departments (Technology)
-- Industry 34: 25 departments (Textile/Garment)
-- Industry 9: 12 departments (Education/Training)
-- =====================================================
