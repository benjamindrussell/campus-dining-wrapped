import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Capture from './pages/Capture'
import Wrapped from './pages/Wrapped'
import ProtectedRoute from './router/ProtectedRoute'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/capture" element={<Capture />} />
				<Route
					path="/wrapped"
					element={
						<ProtectedRoute>
							<Wrapped />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App