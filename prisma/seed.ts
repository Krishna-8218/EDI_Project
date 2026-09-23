import {
  PrismaClient,
  Role,
  UserStatus,
  AssetStatus,
  AssignmentStatus,
  MaintenanceType,
  MaintenanceStatus,
  ReportType,
  ReportStatus,
  Prisma,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AssetFlow database seeding...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Cleaning existing records...');
  await prisma.auditLog.deleteMany();
  await prisma.assetReport.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.assetAssignment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password for all seed accounts
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

  // 3. Seed Users (10 Users)
  console.log('👤 Seeding Users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@assetflow.com',
        password: defaultPasswordHash,
        role: Role.ADMIN,
        department: 'Executive Administration',
        phone: '+1-555-0101',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-ADM-001',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Operations Manager',
        email: 'manager@assetflow.com',
        password: defaultPasswordHash,
        role: Role.MANAGER,
        department: 'IT Operations',
        phone: '+1-555-0102',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-MGR-002',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Standard Employee',
        email: 'employee@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Software Engineering',
        phone: '+1-555-0103',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-EMP-003',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Devon Patel',
        email: 'devon.patel@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Software Engineering',
        phone: '+1-555-0104',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-EMP-004',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Claire Beauchamp',
        email: 'claire.beauchamp@assetflow.com',
        password: defaultPasswordHash,
        role: Role.MANAGER,
        department: 'Finance & Accounting',
        phone: '+1-555-0105',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-MGR-005',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Marcus Vance',
        email: 'marcus.vance@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Research & Development',
        phone: '+1-555-0106',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-EMP-006',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Elena Rostova',
        email: 'elena.rostova@assetflow.com',
        password: defaultPasswordHash,
        role: Role.MANAGER,
        department: 'Facilities & Security',
        phone: '+1-555-0107',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-MGR-007',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Liam Zhang',
        email: 'liam.zhang@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Design & UX',
        phone: '+1-555-0108',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-EMP-008',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sophia Alvarez',
        email: 'sophia.alvarez@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Marketing & Sales',
        phone: '+1-555-0109',
        status: UserStatus.ACTIVE,
        rfidCardId: 'CARD-EMP-009',
      },
    }),
    prisma.user.create({
      data: {
        name: 'James Wilson',
        email: 'james.wilson@assetflow.com',
        password: defaultPasswordHash,
        role: Role.EMPLOYEE,
        department: 'Human Resources',
        phone: '+1-555-0110',
        status: UserStatus.INACTIVE,
        rfidCardId: 'CARD-EMP-010',
      },
    }),
  ]);
  console.log(`✅ Created ${users.length} Users`);

  const [
    adminUser,
    managerUser,
    employeeUser,
    devonUser,
    claireUser,
    marcusUser,
    elenaUser,
    liamUser,
    sophiaUser,
  ] = users;

  // 4. Seed Assets (20 Assets across Laptop, Desktop, Monitor, Mobile, Tablet, Printer, Networking, Furniture)
  console.log('💻 Seeding Assets...');
  const assetData = [
    {
      assetTag: 'AST-LAP-001',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Laptop',
      description: 'Apple M3 Max 16-core CPU, 40-core GPU, 64GB Unified Memory, 2TB SSD, Space Black.',
      serialNumber: 'SN-APL-MBP16-9081',
      manufacturer: 'Apple Inc.',
      model: 'MacBook Pro 16-inch 2023',
      purchaseDate: new Date('2024-01-10T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(3999.0),
      warrantyExpiry: new Date('2027-01-10T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Engineering Bay Desk 4',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-LAP-002',
      name: 'Dell Precision 7680 Workstation',
      category: 'Laptop',
      description: 'Intel Core i9-13950HX, 64GB DDR5, NVIDIA RTX 4000 Ada 12GB, 1TB NVMe SSD.',
      serialNumber: 'SN-DELL-PR76-4412',
      manufacturer: 'Dell Technologies',
      model: 'Precision 7680',
      purchaseDate: new Date('2024-02-15T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(3450.0),
      warrantyExpiry: new Date('2027-02-15T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'IT Storage Room 102',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-LAP-003',
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      category: 'Laptop',
      description: 'Intel Core i7-1365U, 32GB LPDDR5, 1TB SSD, 14" 2.8K OLED Display.',
      serialNumber: 'SN-LEN-X1C11-8890',
      manufacturer: 'Lenovo',
      model: 'ThinkPad X1 Carbon Gen 11',
      purchaseDate: new Date('2023-11-20T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(2150.0),
      warrantyExpiry: new Date('2026-11-20T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Finance Office Desk 12',
      condition: 'Good',
    },
    {
      assetTag: 'AST-LAP-004',
      name: 'HP EliteBook 840 G10',
      category: 'Laptop',
      description: 'Intel Core i5-1335U, 16GB RAM, 512GB SSD, Windows 11 Pro Enterprise.',
      serialNumber: 'SN-HP-EB840-7721',
      manufacturer: 'HP Inc.',
      model: 'EliteBook 840 G10',
      purchaseDate: new Date('2023-08-14T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1450.0),
      warrantyExpiry: new Date('2026-08-14T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'IT Storage Room 102',
      condition: 'Good',
    },
    {
      assetTag: 'AST-DSK-005',
      name: 'Apple Mac Studio M2 Ultra',
      category: 'Desktop',
      description: 'M2 Ultra 24-core CPU, 76-core GPU, 128GB Unified Memory, 4TB SSD.',
      serialNumber: 'SN-APL-MCS-5512',
      manufacturer: 'Apple Inc.',
      model: 'Mac Studio 2023',
      purchaseDate: new Date('2023-09-01T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(5999.0),
      warrantyExpiry: new Date('2026-09-01T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Creative Studio Suite A',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-DSK-006',
      name: 'Dell OptiPlex 7010 Micro',
      category: 'Desktop',
      description: 'Intel Core i7-13700T, 32GB RAM, 512GB NVMe SSD, Ultra compact form factor.',
      serialNumber: 'SN-DELL-OPT70-3321',
      manufacturer: 'Dell Technologies',
      model: 'OptiPlex 7010 Micro',
      purchaseDate: new Date('2023-05-18T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1100.0),
      warrantyExpiry: new Date('2026-05-18T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Reception Desk 1',
      condition: 'Good',
    },
    {
      assetTag: 'AST-MON-007',
      name: 'Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)',
      category: 'Monitor',
      description: '31.5" 4K UHD IPS Black, 90W Power Delivery, RJ45 Ethernet hub built-in.',
      serialNumber: 'SN-DELL-U32-9901',
      manufacturer: 'Dell Technologies',
      model: 'U3223QE',
      purchaseDate: new Date('2023-10-12T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(820.0),
      warrantyExpiry: new Date('2026-10-12T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Engineering Bay Desk 4',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-MON-008',
      name: 'LG UltraFine 27" 5K Display',
      category: 'Monitor',
      description: '27MD5KL-B 5K IPS Panel with Thunderbolt 3 connectivity and stereo speakers.',
      serialNumber: 'SN-LG-5K27-1123',
      manufacturer: 'LG Electronics',
      model: '27MD5KL-B',
      purchaseDate: new Date('2023-04-05T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1299.0),
      warrantyExpiry: new Date('2026-04-05T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Creative Studio Suite A',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-MOB-009',
      name: 'iPhone 15 Pro Max 256GB',
      category: 'Mobile',
      description: 'A17 Pro chip, Titanium design, 48MP camera system, USB-C enterprise provisioned.',
      serialNumber: 'SN-APL-IP15PM-8832',
      manufacturer: 'Apple Inc.',
      model: 'iPhone 15 Pro Max',
      purchaseDate: new Date('2023-10-01T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1199.0),
      warrantyExpiry: new Date('2025-10-01T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Executive Suite 401',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-MOB-010',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      category: 'Mobile',
      description: 'Snapdragon 8 Gen 3, S-Pen included, Titanium Gray, Knox Enterprise Security.',
      serialNumber: 'SN-SAM-S24U-4402',
      manufacturer: 'Samsung Electronics',
      model: 'Galaxy S24 Ultra',
      purchaseDate: new Date('2024-02-10T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1399.0),
      warrantyExpiry: new Date('2026-02-10T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'IT Mobile Safe Room',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-TAB-011',
      name: 'iPad Pro 12.9" M2 Wi-Fi + Cellular 256GB',
      category: 'Tablet',
      description: 'Liquid Retina XDR Mini-LED display, Apple Pencil 2 support, Magic Keyboard bundled.',
      serialNumber: 'SN-APL-IPD12-6619',
      manufacturer: 'Apple Inc.',
      model: 'iPad Pro 12.9 6th Gen',
      purchaseDate: new Date('2023-07-22T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1499.0),
      warrantyExpiry: new Date('2025-07-22T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Marketing Department Desk 3',
      condition: 'Good',
    },
    {
      assetTag: 'AST-TAB-012',
      name: 'Panasonic Toughbook G2 Rugged Tablet',
      category: 'Tablet',
      description: 'MIL-STD-810H, IP65 water/dust resistant, 10.1" 1000 nit sunlight viewable screen.',
      serialNumber: 'SN-PAN-TBG2-9901',
      manufacturer: 'Panasonic Corporation',
      model: 'FZ-G2',
      purchaseDate: new Date('2022-06-11T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(2850.0),
      warrantyExpiry: new Date('2025-06-11T00:00:00Z'),
      status: AssetStatus.DAMAGED,
      location: 'Security Maintenance Bay',
      condition: 'Damaged',
    },
    {
      assetTag: 'AST-PRN-013',
      name: 'HP LaserJet Enterprise Flow MFP M635z',
      category: 'Printer',
      description: 'High-speed heavy-duty monochrome multi-function printer with dual-sided scanning.',
      serialNumber: 'SN-HP-MFPM635-1234',
      manufacturer: 'HP Inc.',
      model: 'LaserJet Flow M635z',
      purchaseDate: new Date('2022-03-15T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(3200.0),
      warrantyExpiry: new Date('2025-03-15T00:00:00Z'),
      status: AssetStatus.UNDER_MAINTENANCE,
      location: 'Main Copy & Print Hub 1st Floor',
      condition: 'Fair',
    },
    {
      assetTag: 'AST-PRN-014',
      name: 'Epson WorkForce Enterprise WF-C21000',
      category: 'Printer',
      description: '100 ppm ultra-high speed color departmental inkjet copier and booklet finisher.',
      serialNumber: 'SN-EPS-WFC21-9988',
      manufacturer: 'Epson Corporation',
      model: 'WF-C21000',
      purchaseDate: new Date('2023-01-20T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(8500.0),
      warrantyExpiry: new Date('2026-01-20T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Administration Print Center',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-NET-015',
      name: 'Cisco Catalyst 9300 48-Port PoE+ Switch',
      category: 'Networking',
      description: '48-Port PoE+ Gigabit managed core switch with 4x 10G SFP+ uplink module.',
      serialNumber: 'SN-CSCO-9300-48P-01',
      manufacturer: 'Cisco Systems',
      model: 'C9300-48P-E',
      purchaseDate: new Date('2023-05-10T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(4650.0),
      warrantyExpiry: new Date('2028-05-10T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Server Room Rack 01',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-NET-016',
      name: 'Fortinet FortiGate 200F Security Gateway Firewall',
      category: 'Networking',
      description: 'Next-Gen enterprise firewall, 27 Gbps firewall throughput, SSL inspection.',
      serialNumber: 'SN-FTNT-FG200F-7741',
      manufacturer: 'Fortinet Inc.',
      model: 'FortiGate 200F',
      purchaseDate: new Date('2023-08-01T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(6200.0),
      warrantyExpiry: new Date('2026-08-01T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Server Room Rack 01',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-NET-017',
      name: 'Cisco Meraki MR57 Wi-Fi 6E Indoor Access Point',
      category: 'Networking',
      description: 'Tri-band 802.11axe 8x8:8 multi-gigabit cloud managed enterprise wireless AP.',
      serialNumber: 'SN-MRK-MR57-3312',
      manufacturer: 'Cisco Meraki',
      model: 'MR57-HW',
      purchaseDate: new Date('2023-09-15T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1400.0),
      warrantyExpiry: new Date('2028-09-15T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Building A Central Atrium Ceiling',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-FUR-018',
      name: 'Herman Miller Aeron Ergonomic Task Chair (Size B)',
      category: 'Furniture',
      description: 'Graphite frame, PostureFit SL lumbar support, fully adjustable arms.',
      serialNumber: 'SN-HM-AERON-8831',
      manufacturer: 'Herman Miller',
      model: 'Aeron Remastered',
      purchaseDate: new Date('2023-02-14T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1695.0),
      warrantyExpiry: new Date('2035-02-14T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Executive Office 401',
      condition: 'Excellent',
    },
    {
      assetTag: 'AST-FUR-019',
      name: 'Steelcase Gesture Ergonomic Office Chair',
      category: 'Furniture',
      description: '3D LiveBack technology, Core Equalizer, 360-degree rotating armrests.',
      serialNumber: 'SN-SC-GESTURE-2210',
      manufacturer: 'Steelcase Inc.',
      model: 'Gesture Series',
      purchaseDate: new Date('2023-03-10T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1480.0),
      warrantyExpiry: new Date('2035-03-10T00:00:00Z'),
      status: AssetStatus.AVAILABLE,
      location: 'Conference Room Beta',
      condition: 'Good',
    },
    {
      assetTag: 'AST-FUR-020',
      name: 'Uplift V2 Commercial Dual-Motor Standing Desk (72" x 30")',
      category: 'Furniture',
      description: 'Solid walnut butcher block top, advanced memory keypad, integrated wire management.',
      serialNumber: 'SN-UPL-V2-7230-01',
      manufacturer: 'Uplift Desk',
      model: 'V2-Commercial',
      purchaseDate: new Date('2023-06-01T00:00:00Z'),
      purchasePrice: new Prisma.Decimal(1250.0),
      warrantyExpiry: new Date('2038-06-01T00:00:00Z'),
      status: AssetStatus.ASSIGNED,
      location: 'Engineering Bay Desk 4',
      condition: 'Excellent',
    },
  ];

  const assets = await Promise.all(
    assetData.map((item) => prisma.asset.create({ data: item }))
  );
  console.log(`✅ Created ${assets.length} Assets`);

  // 5. Seed Asset Assignments
  console.log('📋 Seeding Asset Assignments...');
  const assignments = await Promise.all([
    prisma.assetAssignment.create({
      data: {
        assetId: assets[0].id, // AST-LAP-001 (MacBook Pro 16)
        userId: devonUser.id,
        assignedAt: new Date('2024-01-15T09:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Assigned for senior software engineering and mobile development.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[2].id, // AST-LAP-003 (ThinkPad X1)
        userId: claireUser.id,
        assignedAt: new Date('2023-11-25T10:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Assigned for financial audits and management reporting.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[4].id, // AST-DSK-005 (Mac Studio)
        userId: liamUser.id,
        assignedAt: new Date('2023-09-05T14:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Assigned for UI/UX rendering, 3D motion graphics, and video production.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[6].id, // AST-MON-007 (Dell UltraSharp 32)
        userId: devonUser.id,
        assignedAt: new Date('2023-10-15T11:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Secondary dual-monitor setup for software engineering.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[7].id, // AST-MON-008 (LG 5K)
        userId: liamUser.id,
        assignedAt: new Date('2023-09-05T14:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Color-calibrated reference display for design studio.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[8].id, // AST-MOB-009 (iPhone 15 Pro Max)
        userId: adminUser.id,
        assignedAt: new Date('2023-10-05T09:30:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Executive corporate mobile phone with secure MDM container.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[10].id, // AST-TAB-011 (iPad Pro)
        userId: sophiaUser.id,
        assignedAt: new Date('2023-08-01T13:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Client presentations, trade shows, and sales demos.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[17].id, // AST-FUR-018 (Aeron Chair)
        userId: adminUser.id,
        assignedAt: new Date('2023-02-15T10:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Executive suite ergonomic seating.',
      },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId: assets[19].id, // AST-FUR-020 (Standing Desk)
        userId: devonUser.id,
        assignedAt: new Date('2023-06-05T09:00:00Z'),
        status: AssignmentStatus.ACTIVE,
        notes: 'Engineering workstation motorized sit-stand desk.',
      },
    }),
    // Historical Returned Assignment
    prisma.assetAssignment.create({
      data: {
        assetId: assets[1].id, // AST-LAP-002 (Dell Precision)
        userId: marcusUser.id,
        assignedAt: new Date('2024-02-20T09:00:00Z'),
        returnedAt: new Date('2024-05-15T17:00:00Z'),
        status: AssignmentStatus.RETURNED,
        notes: 'Temporary loaner laptop during ML model training phase. [Returned in pristine condition]',
      },
    }),
  ]);
  console.log(`✅ Created ${assignments.length} Asset Assignments`);

  // 6. Seed Maintenance Records
  console.log('🔧 Seeding Maintenance Records...');
  const maintenanceRecords = await Promise.all([
    prisma.maintenance.create({
      data: {
        assetId: assets[12].id, // AST-PRN-013 (HP LaserJet MFP)
        title: 'Fuser Roller Replacement & Optics Cleaning',
        description: 'Scheduled preventive service to replace worn fuser kit and clear duplex sensor jams.',
        maintenanceType: MaintenanceType.CORRECTIVE,
        scheduledDate: new Date('2024-06-20T09:00:00Z'),
        cost: new Prisma.Decimal(280.0),
        status: MaintenanceStatus.IN_PROGRESS,
        performedBy: 'HP Certified Field Engineer (Mark Sanders)',
      },
    }),
    prisma.maintenance.create({
      data: {
        assetId: assets[11].id, // AST-TAB-012 (Panasonic Toughbook)
        title: 'Screen Glass Replacement & Pressure Sealing',
        description: 'Digitizer cracked during field operation. Sent for Panasonic factory certified re-glassing.',
        maintenanceType: MaintenanceType.CORRECTIVE,
        scheduledDate: new Date('2024-06-18T10:00:00Z'),
        cost: new Prisma.Decimal(450.0),
        status: MaintenanceStatus.SCHEDULED,
        performedBy: 'Panasonic Authorized Depot',
      },
    }),
    prisma.maintenance.create({
      data: {
        assetId: assets[14].id, // AST-NET-015 (Cisco Catalyst 9300)
        title: 'IOS-XE Firmware Security Upgrade & Fan Dusting',
        description: 'Upgraded to Cisco IOS-XE Cupertino 17.9.4a LTS release with patched zero-day CVEs.',
        maintenanceType: MaintenanceType.PREVENTIVE,
        scheduledDate: new Date('2024-04-10T02:00:00Z'),
        completedDate: new Date('2024-04-10T04:30:00Z'),
        cost: new Prisma.Decimal(0.0),
        status: MaintenanceStatus.COMPLETED,
        performedBy: 'IT Infrastructure Team',
      },
    }),
    prisma.maintenance.create({
      data: {
        assetId: assets[13].id, // AST-PRN-014 (Epson WF-C21000)
        title: 'Quarterly Printhead Alignment and Ink Purge',
        description: 'Routine maintenance check, waste ink box replacement, paper feed roller vacuuming.',
        maintenanceType: MaintenanceType.ROUTINE,
        scheduledDate: new Date('2024-05-15T11:00:00Z'),
        completedDate: new Date('2024-05-15T12:30:00Z'),
        cost: new Prisma.Decimal(120.0),
        status: MaintenanceStatus.COMPLETED,
        performedBy: 'Epson Enterprise Support',
      },
    }),
  ]);
  console.log(`✅ Created ${maintenanceRecords.length} Maintenance Records`);

  // 7. Seed Asset Reports (Incident / Damage / Loss)
  console.log('📝 Seeding Asset Reports...');
  const reports = await Promise.all([
    prisma.assetReport.create({
      data: {
        assetId: assets[11].id, // AST-TAB-012 (Panasonic Toughbook)
        reportedBy: elenaUser.id,
        type: ReportType.DAMAGE,
        description: 'Corner dropped on asphalt dock during morning perimeter inspection; touchscreen digitizer cracked.',
        status: ReportStatus.UNDER_REVIEW,
      },
    }),
    prisma.assetReport.create({
      data: {
        assetId: assets[12].id, // AST-PRN-013 (HP LaserJet)
        reportedBy: claireUser.id,
        type: ReportType.ISSUE,
        description: 'Printer making loud grinding noise during duplex booklet printing and throwing error 50.4 Fuser Error.',
        status: ReportStatus.UNDER_REVIEW,
      },
    }),
    prisma.assetReport.create({
      data: {
        assetId: assets[18].id, // AST-FUR-019 (Steelcase Chair)
        reportedBy: employeeUser.id,
        type: ReportType.ISSUE,
        description: 'Right armrest height lock mechanism is slipping down under normal forearm weight.',
        status: ReportStatus.PENDING,
      },
    }),
    prisma.assetReport.create({
      data: {
        assetId: assets[3].id, // AST-LAP-004 (HP EliteBook)
        reportedBy: devonUser.id,
        type: ReportType.ISSUE,
        description: 'Battery health showing 78% after firmware update. Requested battery diagnostic check.',
        status: ReportStatus.RESOLVED,
        resolvedAt: new Date('2024-05-10T16:00:00Z'),
      },
    }),
  ]);
  console.log(`✅ Created ${reports.length} Asset Reports`);

  // 8. Seed Audit Logs
  console.log('🛡️ Seeding Audit Logs...');
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: adminUser.id,
        description: 'System Administrator account created with full administrative privileges.',
        createdAt: new Date('2024-01-01T08:00:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ASSET_CREATED',
        entity: 'Asset',
        entityId: assets[0].id,
        description: 'Created asset: MacBook Pro 16" M3 Max (AST-LAP-001).',
        createdAt: new Date('2024-01-10T09:15:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: managerUser.id,
        action: 'ASSET_ASSIGNED',
        entity: 'AssetAssignment',
        entityId: assignments[0].id,
        description: 'Asset AST-LAP-001 assigned to Devon Patel (Software Engineering).',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ASSET_CREATED',
        entity: 'Asset',
        entityId: assets[4].id,
        description: 'Created asset: Apple Mac Studio M2 Ultra (AST-DSK-005).',
        createdAt: new Date('2023-09-01T10:00:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: managerUser.id,
        action: 'ASSET_ASSIGNED',
        entity: 'AssetAssignment',
        entityId: assignments[2].id,
        description: 'Asset AST-DSK-005 assigned to Liam Zhang (Design & UX).',
        createdAt: new Date('2023-09-05T14:00:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: elenaUser.id,
        action: 'REPORT_DAMAGE',
        entity: 'AssetReport',
        entityId: reports[0].id,
        description: 'Filed damage report for Panasonic Toughbook (AST-TAB-012).',
        createdAt: new Date('2024-06-18T09:30:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: managerUser.id,
        action: 'MAINTENANCE_CREATED',
        entity: 'Maintenance',
        entityId: maintenanceRecords[0].id,
        description: 'Scheduled corrective maintenance for HP LaserJet MFP M635z.',
        createdAt: new Date('2024-06-20T09:00:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: managerUser.id,
        action: 'MAINTENANCE_COMPLETED',
        entity: 'Maintenance',
        entityId: maintenanceRecords[2].id,
        description: 'Completed Cisco Catalyst 9300 IOS-XE security firmware upgrade.',
        createdAt: new Date('2024-04-10T04:30:00Z'),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: adminUser.id,
        description: 'Admin user logged into AssetFlow dashboard.',
        createdAt: new Date('2024-06-21T08:00:00Z'),
      },
    }),
  ]);
  console.log(`✅ Created ${auditLogs.length} Audit Logs`);

  console.log('\n====================================================');
  console.log('🎉 AssetFlow Database Seeding Successfully Completed!');
  console.log('====================================================');
  console.log('Demo Login Credentials (Default Password: Password@123)');
  console.log('----------------------------------------------------');
  console.log('👑 Admin:    admin@assetflow.com');
  console.log('💼 Manager:  manager@assetflow.com');
  console.log('🧑 Employee: employee@assetflow.com');
  console.log('====================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
