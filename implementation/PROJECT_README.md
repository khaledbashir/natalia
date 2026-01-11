# ANC Proposal Automation System

## 🎯 Project Overview

A Configure-Price-Quote (CPQ) system designed to automate ANC's high-volume LED display proposal process. The system takes client requirements, calculates comprehensive pricing across all cost categories, and generates professional ANC-branded proposals and internal audit Excel files in under 5 minutes.

### Business Value
- **Speed**: Generate proposals in 5 minutes vs. multi-day manual process
- **Accuracy**: Mathematically perfect calculations based on ANC's pricing logic
- **Consistency**: Standardized outputs across all estimators
- **Professionalism**: ANC-branded PDFs with complete cost breakdowns
- **Flexibility**: Adaptable to any venue type or configuration

### Target Audience
- ANC Estimators & Sales Engineers
- ANC Leadership (for approval)
- ANC Clients (final proposal recipients)

---

## 🏗️ System Architecture

### Frontend (Next.js + React)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Tailwind CSS
- **Components**: Modular React components
- **State Management**: React Hooks (useState, useMemo)
- **Icons**: Lucide React

### Backend (Python + FastAPI)
- **Framework**: FastAPI
- **Calculation Engine**: Custom Python calculator
- **PDF Generation**: ReportLab
- **Excel Generation**: OpenPyXL
- **AI Integration**: GLM-4.7 (via API)

### Data Flow
```
User Input (Frontend)
    ↓
API Request (Next.js → FastAPI)
    ↓
Configuration Analysis (AI + Rules Engine)
    ↓
Cost Calculation (12 Categories)
    ↓
Output Generation (PDF + Excel)
    ↓
Download to Client
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- pip (Python package manager)

### Installation

#### 1. Clone Repository
```bash
git clone <repository-url>
cd natalia
```

#### 2. Install Frontend Dependencies
```bash
cd anc-cpq
npm install
```

#### 3. Install Backend Dependencies
```bash
cd ../src
pip install -r requirements.txt
```

#### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd anc-cpq
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd src
python server.py
# Runs on http://localhost:8000
```

#### 5. Access Application
Open browser to: `http://localhost:3000`

---

## 📁 Project Structure

```
natalia/
├── anc-cpq/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/          # API routes (if needed)
│   │   │   ├── page.tsx      # Main application
│   │   │   └── globals.css   # Global styles
│   │   ├── components/        # React components
│   │   │   ├── ConversationalWizard.tsx
│   │   │   ├── Preview.tsx
│   │   │   ├── Wizard.tsx
│   │   │   └── ANCConfigurationWizard.tsx  # NEW
│   │   └── lib/              # Shared utilities
│   │       ├── calculator.ts
│   │       └── types.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── src/                       # Python Backend
│   ├── calculator.py           # Main calculation engine
│   ├── catalog.py             # Product catalog (NEW)
│   ├── pdf_generator.py        # PDF generation
│   ├── excel_generator.py      # Excel generation
│   ├── server.py              # FastAPI server
│   ├── config.json            # Configuration
│   └── requirements.txt
│
├── docs/                      # Documentation
│   └── IMPLEMENTATION_CHECKLIST.md
│
├── implementation/            # Implementation files
│   ├── PROJECT_README.md      # This file
│   └── GIT_SETUP.md
│
├── SYSTEM_MANIFEST.md        # System documentation
├── Dockerfile                # Docker configuration
└── .gitignore              # Git ignore rules
```

---

## 🔧 Key Features

### Current Features (Working)
✅ Conversational AI interface for natural language input  
✅ Multi-display configuration support  
✅ Real-time cost calculations  
✅ PDF proposal generation  
✅ Excel audit file generation  
✅ Progress tracking  
✅ Margin and contingency controls  

### New Features (In Development)
🚧 Question-based configuration wizard  
🚧 Complete 12-category cost calculator  
🚧 Real ANC products catalog  
🚧 ANC-branded PDF templates  
🚧 Industry templates (NFL, NBA, NCAA, Transit)  
🚧 Demo presets for one-click scenarios  
🚧 Enhanced cost breakdown display  

### Future Features (Planned)
📋 Salesforce CRM integration  
📋 Multi-user collaboration  
📋 User authentication  
📋 Project database  
📋 Historical proposal analytics  

---

## 📊 Cost Categories (12 Total)

The system calculates costs across these categories (as specified by ANC):

1. **Hardware** - LED display panels, cabinets
2. **Structural Materials** - Steel, truss, mounting hardware
3. **Structural Labor** - Installation labor for structure
4. **LED Installation** - Display installation labor
5. **Electrical & Data - Materials** - PDUs, cabling, switches
6. **Electrical & Data - Subcontracting** - Electrical contractor costs
7. **CMS Equipment** - LiveSync licenses, servers, players
8. **CMS Installation** - CMS setup labor
9. **CMS Commissioning** - CMS testing and configuration
10. **Project Management** - PM oversight
11. **General Conditions** - Insurance, bonds, overhead
12. **Travel & Expenses** - Flights, hotels, per diem
13. **Submittals** - Engineering documents
14. **Engineering** - Structural and electrical engineering
15. **Permits** - Local jurisdiction permitting
16. **Installation & Commissioning** - Final testing and handoff

---

## 🎨 Product Catalog

### Display Types
- **Center Hung** - Main center-mounted displays (4K/6mm)
- **Ribbon Boards** - Fascia and concourse displays (6mm/10mm)
- **Scoreboards** - Traditional scoreboards with video
- **Fine Pitch** - High-res displays for premium areas (1.5mm/2.5mm)
- **Endzone Displays** - Large format wall displays
- **Digital Kiosks** - Interactive or informational kiosks

### Software
- **LiveSync** - ANC's proprietary venue control platform
  - Per Screen License: $2,000/year
  - Per Venue License: $50,000/year

### Service Packages
- **Gold** (24/7 Full Support) - 15% of project value annually
- **Silver** (Event-Only) - 8% of project value annually
- **Bronze** (Basic Maintenance) - 5% of project value annually

---

## 🏟️ Industry Templates

Pre-configured templates for common venue types:

### NFL Stadium Template
- Center Hung 4K + Ribbon Boards + Endzone Displays
- LiveSync + Gold Service
- Game-day operations included
- 30% target margin

### NBA Arena Template
- Center Hung 6mm + Fine Pitch Clubs + Ribbon Boards
- LiveSync + Silver Service
- Event support included
- 32% target margin

### NCAA Stadium Template
- Scoreboard + Ribbon Boards + Concourse Displays
- LiveSync + Bronze Service
- Basic maintenance included
- 28% target margin

### Transit Hub Template
- Digital Kiosks + Information Displays + Wayfinding
- 24/7 operation + Gold Service
- Emergency messaging integration
- 25% target margin

---

## 🛠️ Development Workflow

### Git Workflow
```bash
# Main branch: main
# Feature branch: feature/anc-proposal-enhancement

# Start new feature
git checkout feature/anc-proposal-enhancement

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/anc-proposal-enhancement
```

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `perf:` - Performance optimization

### Testing Before Commit
1. Run frontend: `npm run dev`
2. Run backend: `python server.py`
3. Test critical path: Configuration → Calculation → PDF/Excel
4. Verify no console errors
5. Test on multiple browsers

---

## 🐛 Troubleshooting

### Frontend Issues
**Problem**: Port 3000 already in use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

**Problem**: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Backend Issues
**Problem**: Python module not found
```bash
# Install dependencies
pip install -r requirements.txt

# Or use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Problem**: CORS errors
- Ensure backend allows frontend origin
- Check `server.py` CORS middleware configuration

### PDF Generation Issues
**Problem**: PDF not generating
- Check ReportLab installation: `pip install reportlab`
- Verify output directory exists
- Check for font loading errors

### Excel Generation Issues
**Problem**: Excel not generating
- Check OpenPyXL installation: `pip install openpyxl`
- Verify Excel template file exists
- Check file permissions for output directory

---

## 📝 Configuration

### Environment Variables (Optional)
Create `.env` file in root:
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# AI Model (if using custom API)
AI_API_KEY=your_api_key
AI_MODEL=glm-4.7
```

### Calculation Configuration
Edit `src/config.json`:
```json
{
  "multipliers": {
    "structural": 0.20,
    "labor": 0.15,
    "shipping": 0.05,
    "bond": 0.01
  },
  "defaults": {
    "margin": 0.30
  }
}
```

---

## 📚 Documentation

- [Implementation Checklist](../docs/IMPLEMENTATION_CHECKLIST.md) - Detailed task list
- [Git Setup Guide](../implementation/GIT_SETUP.md) - Git workflow instructions
- [System Manifest](../SYSTEM_MANIFEST.md) - Technical architecture details

---

## 🎯 Wednesday Demo Preparation

### Demo Scenarios Ready
1. **NFL Stadium** - Levi's Stadium example
2. **NBA Arena** - Gainbridge Fieldhouse example
3. **Transit Hub** - Moynihan Train Hall example

### Demo Checklist
- [ ] All 12 cost categories working
- [ ] ANC products in catalog
- [ ] Question wizard complete
- [ ] PDF generation working
- [ ] Excel generation working
- [ ] Demo presets configured
- [ ] Demo script practiced
- [ ] Backup created

---

## 🤝 Contributing

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: PEP 8
- **Comments**: Clear, descriptive comments for complex logic

### Pull Request Process
1. Create feature branch
2. Make changes and test thoroughly
3. Commit with conventional commits
4. Push to remote
5. Create pull request
6. Request code review
7. Address feedback
8. Merge to main

---

## 📞 Support

For questions or issues:
- Ahmad Basheer (Project Lead)
- Check documentation first
- Review implementation checklist
- Check Git setup guide

---

## 📄 License

Proprietary - ANC Sports Enterprises, LLC
All rights reserved.

---

## 🎉 Success Criteria

The system is successful when:
- ✅ ANC can generate proposals in under 5 minutes
- ✅ All 12 cost categories are calculated accurately
- ✅ Output matches ANC's professional standards
- ✅ Estimators can use the system without training
- ✅ System saves time and reduces errors
- ✅ Leadership approves for production use

---

**Last Updated**: January 2025  
**Version**: 2.0 (In Development)  
**Status**: 🚧 Active Development  
**Demo Target**: Wednesday Presentation