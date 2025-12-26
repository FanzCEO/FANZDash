import express from 'express';
import multer from 'multer';
import { body, query, param, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
import { documentVault } from '../vault/DocumentVault';
import rateLimit from 'express-rate-limit';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

const router = express.Router();

// Configure secure upload with virus scanning
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Rate limiting
const erpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

// Mock data storage with seed data
const inventory: any[] = [
  { id: 'inv_001', sku: 'CAM-4K-001', name: '4K Streaming Camera', category: 'Equipment', description: 'Professional 4K streaming camera', quantity: 15, reorderLevel: 5, unitPrice: 899.99, cost: 650, supplier: 'TechPro Supplies', warehouse: 'Main', status: 'in_stock', lastRestocked: '2025-12-20' },
  { id: 'inv_002', sku: 'MIC-PRO-002', name: 'Professional Microphone', category: 'Audio', description: 'Studio-grade condenser microphone', quantity: 25, reorderLevel: 10, unitPrice: 299.99, cost: 180, supplier: 'AudioMax', warehouse: 'Main', status: 'in_stock', lastRestocked: '2025-12-18' },
  { id: 'inv_003', sku: 'LIGHT-LED-003', name: 'LED Ring Light Kit', category: 'Lighting', description: '18-inch LED ring light with stand', quantity: 3, reorderLevel: 8, unitPrice: 149.99, cost: 85, supplier: 'LightWorks', warehouse: 'Main', status: 'low_stock', lastRestocked: '2025-12-10' },
  { id: 'inv_004', sku: 'TRIPOD-001', name: 'Heavy Duty Tripod', category: 'Equipment', description: 'Professional camera tripod', quantity: 20, reorderLevel: 5, unitPrice: 199.99, cost: 120, supplier: 'TechPro Supplies', warehouse: 'Main', status: 'in_stock', lastRestocked: '2025-12-15' },
  { id: 'inv_005', sku: 'BACKDROP-GRN', name: 'Green Screen Backdrop', category: 'Studio', description: '10x12ft green screen', quantity: 8, reorderLevel: 3, unitPrice: 79.99, cost: 45, supplier: 'StudioGear', warehouse: 'Secondary', status: 'in_stock', lastRestocked: '2025-12-12' },
];

const projects: any[] = [
  { id: 'proj_001', name: 'Platform Migration v2.0', description: 'Migrate all platforms to new infrastructure', status: 'in_progress', priority: 'high', startDate: '2025-12-01', endDate: '2026-02-28', budget: 150000, spent: 45000, progress: 35, manager: 'Sarah Chen', team: ['Dev Team A', 'DevOps'], client: 'Internal', milestones: [{ id: 'm1', name: 'Phase 1 Complete', dueDate: '2025-12-31', completed: true }, { id: 'm2', name: 'Phase 2 Complete', dueDate: '2026-01-31', completed: false }] },
  { id: 'proj_002', name: 'Mobile App Launch', description: 'Launch iOS and Android apps', status: 'planning', priority: 'critical', startDate: '2026-01-15', endDate: '2026-04-30', budget: 200000, spent: 0, progress: 0, manager: 'Mike Johnson', team: ['Mobile Team'], client: 'Internal', milestones: [] },
  { id: 'proj_003', name: 'Payment Gateway Integration', description: 'Integrate new payment processors', status: 'completed', priority: 'high', startDate: '2025-10-01', endDate: '2025-12-15', budget: 50000, spent: 48500, progress: 100, manager: 'Lisa Park', team: ['Payments Team'], client: 'Internal', milestones: [{ id: 'm1', name: 'Integration Complete', dueDate: '2025-12-15', completed: true }] },
];

const resources: any[] = [
  { id: 'res_001', name: 'AWS EC2 Cluster', type: 'equipment', description: 'Primary compute cluster', quantity: 12, unit: 'instances', costPerUnit: 500, status: 'in_use', location: 'us-east-1', assignedTo: 'Platform Team', maintenanceSchedule: 'Monthly' },
  { id: 'res_002', name: 'Video Encoding Servers', type: 'equipment', description: 'Dedicated encoding hardware', quantity: 4, unit: 'servers', costPerUnit: 2000, status: 'in_use', location: 'Data Center A', assignedTo: 'Media Team', maintenanceSchedule: 'Quarterly' },
  { id: 'res_003', name: 'CDN Bandwidth', type: 'software', description: 'Content delivery network allocation', quantity: 100, unit: 'TB/month', costPerUnit: 50, status: 'available', location: 'Global', assignedTo: 'Operations', maintenanceSchedule: 'N/A' },
  { id: 'res_004', name: 'Studio Space A', type: 'facility', description: 'Main production studio', quantity: 1, unit: 'room', costPerUnit: 5000, status: 'in_use', location: 'HQ Building', assignedTo: 'Content Team', maintenanceSchedule: 'Weekly' },
];

const accounts: any[] = [
  { id: 'acc_001', name: 'Operating Account', type: 'asset', accountNumber: '1000-001', balance: 2500000, status: 'active', createdAt: '2025-01-01' },
  { id: 'acc_002', name: 'Payroll Account', type: 'liability', accountNumber: '2000-001', balance: 450000, status: 'active', createdAt: '2025-01-01' },
  { id: 'acc_003', name: 'Revenue - Subscriptions', type: 'revenue', accountNumber: '4000-001', balance: 1850000, status: 'active', createdAt: '2025-01-01' },
  { id: 'acc_004', name: 'Revenue - Tips', type: 'revenue', accountNumber: '4000-002', balance: 320000, status: 'active', createdAt: '2025-01-01' },
  { id: 'acc_005', name: 'Operating Expenses', type: 'expense', accountNumber: '5000-001', balance: 680000, status: 'active', createdAt: '2025-01-01' },
];

const budgets: any[] = [
  { id: 'budget_001', department: 'Engineering', category: 'Development', year: 2025, allocated: 500000, spent: 385000, remaining: 115000, status: 'active', period: 'Annual' },
  { id: 'budget_002', department: 'Marketing', category: 'Advertising', year: 2025, allocated: 200000, spent: 165000, remaining: 35000, status: 'active', period: 'Annual' },
  { id: 'budget_003', department: 'Operations', category: 'Infrastructure', year: 2025, allocated: 350000, spent: 290000, remaining: 60000, status: 'active', period: 'Annual' },
  { id: 'budget_004', department: 'HR', category: 'Training', year: 2025, allocated: 75000, spent: 42000, remaining: 33000, status: 'active', period: 'Annual' },
];

const transactions: any[] = [
  { id: 'txn_001', type: 'credit', accountId: 'acc_003', amount: 125000, description: 'December subscription revenue', date: '2025-12-25', createdBy: 'system', status: 'completed', category: 'Revenue' },
  { id: 'txn_002', type: 'debit', accountId: 'acc_005', amount: 45000, description: 'AWS infrastructure costs', date: '2025-12-24', createdBy: 'system', status: 'completed', category: 'Infrastructure' },
  { id: 'txn_003', type: 'credit', accountId: 'acc_004', amount: 28500, description: 'Creator tips - weekly settlement', date: '2025-12-23', createdBy: 'system', status: 'completed', category: 'Revenue' },
  { id: 'txn_004', type: 'debit', accountId: 'acc_002', amount: 85000, description: 'Bi-weekly payroll', date: '2025-12-20', createdBy: 'hr_admin', status: 'completed', category: 'Payroll' },
  { id: 'txn_005', type: 'debit', accountId: 'acc_005', amount: 12500, description: 'Marketing campaign - December', date: '2025-12-18', createdBy: 'marketing', status: 'completed', category: 'Marketing' },
];

const purchaseOrders: any[] = [
  { id: 'po_001', poNumber: 'PO-2025-001', supplierId: 'sup_001', supplierName: 'TechPro Supplies', items: [{ name: '4K Cameras', quantity: 10, unitPrice: 650 }], totalAmount: 6500, status: 'confirmed', orderDate: '2025-12-20', expectedDelivery: '2025-12-30', notes: 'Q1 inventory replenishment' },
  { id: 'po_002', poNumber: 'PO-2025-002', supplierId: 'sup_002', supplierName: 'AudioMax', items: [{ name: 'Microphones', quantity: 20, unitPrice: 180 }, { name: 'Audio Cables', quantity: 50, unitPrice: 15 }], totalAmount: 4350, status: 'sent', orderDate: '2025-12-22', expectedDelivery: '2026-01-05', notes: 'Audio equipment upgrade' },
  { id: 'po_003', poNumber: 'PO-2025-003', supplierId: 'sup_003', supplierName: 'LightWorks', items: [{ name: 'LED Ring Lights', quantity: 15, unitPrice: 85 }], totalAmount: 1275, status: 'pending', orderDate: '2025-12-26', expectedDelivery: '2026-01-10', notes: 'Low stock replenishment' },
];

const suppliers: any[] = [
  { id: 'sup_001', name: 'TechPro Supplies', contact: 'vendor@techpro.com', phone: '555-0101' },
  { id: 'sup_002', name: 'AudioMax', contact: 'sales@audiomax.com', phone: '555-0102' },
  { id: 'sup_003', name: 'LightWorks', contact: 'orders@lightworks.com', phone: '555-0103' },
];

const assets: any[] = [];
const workflows: any[] = [];

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ============ INVENTORY MANAGEMENT ============

/**
 * GET /api/erp/inventory
 * Get all inventory items
 */
router.get('/inventory', isAuthenticated, erpLimiter, async (req, res) => {
  try {
    const { category, status, lowStock, search, page = 1, limit = 50 } = req.query;

    let filtered = [...inventory];

    if (category) {
      filtered = filtered.filter(i => i.category === category);
    }
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }
    if (lowStock === 'true') {
      filtered = filtered.filter(i => i.quantity <= i.reorderLevel);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchLower) ||
        i.sku?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      items: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      lowStockCount: inventory.filter(i => i.quantity <= i.reorderLevel).length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/erp/inventory
 * Add new inventory item
 */
router.post('/inventory',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
    body('unitPrice').isNumeric().withMessage('Unit price must be numeric'),
    body('reorderLevel').optional().isInt({ min: 0 })
  ],
  handleValidation,
  async (req, res) => {
    try {
      const item = {
        id: `inv_${Date.now()}`,
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id,
        lastUpdated: new Date().toISOString()
      };

      inventory.push(item);

      res.status(201).json({ message: 'Inventory item created', item });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  }
);

/**
 * POST /api/erp/inventory/import
 * Import inventory from CSV
 */
router.post('/inventory/import',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (req.file.mimetype !== 'text/csv') {
        return res.status(400).json({ error: 'Only CSV files are allowed' });
      }

      // Store the CSV
      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'erp',
          tags: ['inventory', 'import', 'csv'],
          description: 'Inventory import CSV'
        }
      );

      // Parse CSV
      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const importedItems = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const itemData: any = {};

        headers.forEach((header, index) => {
          itemData[header] = values[index];
        });

        if (itemData.name && itemData.sku) {
          const item = {
            id: `inv_${Date.now()}_${i}`,
            ...itemData,
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: req.user?.id,
            importedFrom: metadata.id
          };
          inventory.push(item);
          importedItems.push(item);
        }
      }

      res.json({
        message: 'Inventory imported successfully',
        imported: importedItems.length,
        items: importedItems
      });
    } catch (error) {
      console.error('Error importing inventory:', error);
      res.status(500).json({ error: 'Failed to import inventory' });
    }
  }
);

// ============ PROJECT MANAGEMENT ============

/**
 * GET /api/erp/projects
 * Get all projects
 */
router.get('/projects', isAuthenticated, async (req, res) => {
  try {
    const { status, priority, managerId } = req.query;

    let filtered = [...projects];

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (priority) {
      filtered = filtered.filter(p => p.priority === priority);
    }
    if (managerId) {
      filtered = filtered.filter(p => p.managerId === managerId);
    }

    res.json({ projects: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/erp/projects
 * Create a new project
 */
router.post('/projects',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('budget').isNumeric().withMessage('Budget must be numeric'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').optional().isISO8601()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const project = {
        id: `proj_${Date.now()}`,
        ...req.body,
        status: 'planning',
        progress: 0,
        actualCost: 0,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      projects.push(project);

      res.status(201).json({ message: 'Project created', project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

/**
 * POST /api/erp/projects/:id/upload
 * Upload project documents (plans, reports, etc.)
 */
router.post('/projects/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const project = projects.find(p => p.id === id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'erp',
          tags: ['project', id],
          description: req.body.description,
          relatedEntityType: 'project',
          relatedEntityId: id
        }
      );

      if (!project.documents) {
        project.documents = [];
      }
      project.documents.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
        uploadedAt: metadata.uploadedAt
      });

      res.json({
        message: 'Document uploaded successfully',
        document: metadata
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// ============ RESOURCE MANAGEMENT ============

/**
 * GET /api/erp/resources
 * Get all resources
 */
router.get('/resources', isAuthenticated, async (req, res) => {
  try {
    const { type, status, projectId } = req.query;

    let filtered = [...resources];

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (projectId) {
      filtered = filtered.filter(r => r.projectId === projectId);
    }

    res.json({ resources: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/**
 * POST /api/erp/resources
 * Allocate resource
 */
router.post('/resources',
  isAuthenticated,
  [
    body('type').isIn(['human', 'equipment', 'material', 'financial']),
    body('name').notEmpty().withMessage('Resource name required'),
    body('projectId').optional().isString()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const resource = {
        id: `res_${Date.now()}`,
        ...req.body,
        status: 'available',
        allocatedAt: req.body.projectId ? new Date().toISOString() : null,
        createdBy: req.user?.id
      };

      resources.push(resource);

      res.status(201).json({ message: 'Resource allocated', resource });
    } catch (error) {
      console.error('Error allocating resource:', error);
      res.status(500).json({ error: 'Failed to allocate resource' });
    }
  }
);

// ============ FINANCIAL ACCOUNTS ============

/**
 * GET /api/erp/accounts
 * Get all accounts
 */
router.get('/accounts', isAuthenticated, async (req, res) => {
  try {
    const { type, status } = req.query;

    let filtered = [...accounts];

    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({ accounts: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * POST /api/erp/accounts
 * Create financial account
 */
router.post('/accounts',
  isAuthenticated,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Account name required'),
    body('type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
    body('accountNumber').notEmpty().withMessage('Account number required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const account = {
        id: `acc_${Date.now()}`,
        ...req.body,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      accounts.push(account);

      res.status(201).json({ message: 'Account created', account });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

// ============ BUDGETS ============

/**
 * GET /api/erp/budgets
 * Get all budgets
 */
router.get('/budgets', isAuthenticated, async (req, res) => {
  try {
    const { department, year, status } = req.query;

    let filtered = [...budgets];

    if (department) {
      filtered = filtered.filter(b => b.department === department);
    }
    if (year) {
      filtered = filtered.filter(b => b.year === Number(year));
    }
    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }

    res.json({ budgets: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

/**
 * POST /api/erp/budgets
 * Create budget
 */
router.post('/budgets',
  isAuthenticated,
  requireAdmin,
  [
    body('department').notEmpty(),
    body('year').isInt({ min: 2020 }),
    body('allocated').isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const budget = {
        id: `budget_${Date.now()}`,
        ...req.body,
        spent: 0,
        remaining: req.body.allocated,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      budgets.push(budget);

      res.status(201).json({ message: 'Budget created', budget });
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
);

/**
 * POST /api/erp/budgets/import
 * Import budgets from Excel
 */
router.post('/budgets/import',
  isAuthenticated,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'erp',
          tags: ['budget', 'import', 'excel'],
          description: 'Budget import file'
        }
      );

      res.json({
        message: 'Budget file uploaded. Processing will complete shortly.',
        fileId: metadata.id
      });
    } catch (error) {
      console.error('Error importing budgets:', error);
      res.status(500).json({ error: 'Failed to import budgets' });
    }
  }
);

// ============ TRANSACTIONS ============

/**
 * GET /api/erp/transactions
 * Get all financial transactions
 */
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const { type, accountId, dateFrom, dateTo } = req.query;

    let filtered = [...transactions];

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (accountId) {
      filtered = filtered.filter(t => t.accountId === accountId);
    }
    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom as string));
    }
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo as string));
    }

    res.json({ transactions: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/erp/transactions
 * Record financial transaction
 */
router.post('/transactions',
  isAuthenticated,
  [
    body('type').isIn(['debit', 'credit']),
    body('accountId').notEmpty(),
    body('amount').isNumeric(),
    body('description').notEmpty()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const transaction = {
        id: `txn_${Date.now()}`,
        ...req.body,
        date: new Date().toISOString(),
        createdBy: req.user?.id,
        status: 'completed'
      };

      transactions.push(transaction);

      // Update account balance
      const account = accounts.find(a => a.id === req.body.accountId);
      if (account) {
        if (req.body.type === 'credit') {
          account.balance += Number(req.body.amount);
        } else {
          account.balance -= Number(req.body.amount);
        }
      }

      res.status(201).json({ message: 'Transaction recorded', transaction });
    } catch (error) {
      console.error('Error recording transaction:', error);
      res.status(500).json({ error: 'Failed to record transaction' });
    }
  }
);

// ============ PURCHASE ORDERS ============

/**
 * GET /api/erp/purchase-orders
 * Get all purchase orders
 */
router.get('/purchase-orders', isAuthenticated, async (req, res) => {
  try {
    const { status, supplierId } = req.query;

    let filtered = [...purchaseOrders];

    if (status) {
      filtered = filtered.filter(po => po.status === status);
    }
    if (supplierId) {
      filtered = filtered.filter(po => po.supplierId === supplierId);
    }

    res.json({ purchaseOrders: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

/**
 * POST /api/erp/purchase-orders
 * Create purchase order
 */
router.post('/purchase-orders',
  isAuthenticated,
  [
    body('supplierId').notEmpty(),
    body('items').isArray(),
    body('totalAmount').isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const po = {
        id: `po_${Date.now()}`,
        poNumber: `PO-${Date.now()}`,
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      purchaseOrders.push(po);

      res.status(201).json({ message: 'Purchase order created', purchaseOrder: po });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  }
);

/**
 * POST /api/erp/purchase-orders/:id/upload
 * Upload PO document
 */
router.post('/purchase-orders/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const po = purchaseOrders.find(p => p.id === id);

      if (!po) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'erp',
          tags: ['purchase-order', id],
          description: req.body.description,
          relatedEntityType: 'purchase_order',
          relatedEntityId: id
        }
      );

      if (!po.documents) {
        po.documents = [];
      }
      po.documents.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
        uploadedAt: metadata.uploadedAt
      });

      res.json({
        message: 'Document uploaded successfully',
        document: metadata
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// ============ ANALYTICS ============

/**
 * GET /api/erp/analytics/dashboard
 * Get ERP dashboard analytics
 */
router.get('/analytics/dashboard', isAuthenticated, async (req, res) => {
  try {
    const analytics = {
      inventory: {
        total: inventory.length,
        lowStock: inventory.filter(i => i.quantity <= i.reorderLevel).length,
        totalValue: inventory.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
      },
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalSpent: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
      },
      financial: {
        totalRevenue: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
        netIncome: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      },
      purchaseOrders: {
        total: purchaseOrders.length,
        pending: purchaseOrders.filter(po => po.status === 'pending').length,
        completed: purchaseOrders.filter(po => po.status === 'completed').length,
        totalValue: purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0)
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching ERP analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
