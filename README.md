# Vistar

Vistar is a modern image processing application built with Electron, React, and Flask. It provides a user-friendly interface for advanced image manipulation and processing capabilities.

## Features

- Modern, responsive user interface built with React and Tailwind CSS
- Cross-platform desktop application using Electron
- Advanced image processing capabilities powered by Flask backend
- Real-time image manipulation and preview
- Support for various image formats
- Automatic updates through GitHub releases

## Tech Stack

### Frontend
- React 18
- Electron
- Vite
- Tailwind CSS
- Framer Motion (for animations)
- React Router DOM
- Axios for API calls

### Backend
- Flask
- OpenCV
- NumPy
- Pandas
- scikit-image
- Pillow

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Abhinav-Upadhyay03/VISTAR.git
cd VISTAR
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Set up the backend:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
pip install -r requirements.txt
```

4. Create environment files:
   - Create `frontend/.env` based on `frontend/.env.example`
   - Create `backend/.env` based on `backend/.env.example`

## Development

1. Start the development server:
```bash
# In the frontend directory
npm run dev
```

This will start both the frontend development server and the Electron app in development mode.

## Building

To build the application:

```bash
# Build both frontend and backend
npm run build-all

# Build only frontend
npm run build

# Build only backend
npm run build-backend
```

The built application will be available in the `frontend/electron-dist` directory.

## Project Structure

```
Vistar/
├── frontend/           # Electron + React frontend
│   ├── src/           # React source code
│   ├── public/        # Static assets
│   └── electron.js    # Electron main process
├── backend/           # Flask backend
│   ├── src/          # Python source code
│   └── dist/         # Built backend
└── venv/             # Python virtual environment
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Abhinav Upadhyay** - [GitHub Profile](https://github.com/Abhinav-Upadhyay03)

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 