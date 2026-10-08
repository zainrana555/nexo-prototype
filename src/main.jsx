import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store'
import { AppLayout, ClientLayout } from './layouts'
import Login from './pages/Login'
import Overview from './pages/staff/Overview'
import Leads, { LeadDetail } from './pages/staff/Leads'
import Files from './pages/staff/Files'
import FileDetail from './pages/staff/FileDetail'
import IdReview from './pages/staff/IdReview'
import Calendar from './pages/staff/Calendar'
import Templates from './pages/staff/Templates'
import Automations from './pages/staff/Automations'
import Settings from './pages/staff/Settings'
import Fax from './pages/staff/Fax'
import Banking from './pages/staff/Banking'
import Inbox from './pages/client/Inbox'
import Mandate from './pages/client/Mandate'
import Intake from './pages/client/Intake'
import Sign from './pages/client/Sign'
import Booking from './pages/client/Booking'
import Portal from './pages/client/Portal'
import MyFile from './pages/client/MyFile'
import Consult from './pages/client/Consult'
import './styles.css'

// HashRouter keeps every route working on GitHub Pages (no server rewrites needed).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="files" element={<Files />} />
            <Route path="files/:id" element={<FileDetail />} />
            <Route path="id-review" element={<IdReview />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="templates" element={<Templates />} />
            <Route path="automations" element={<Automations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="fax" element={<Fax />} />
            <Route path="banking" element={<Banking />} />
          </Route>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Inbox />} />
            <Route path="mandate" element={<Mandate />} />
            <Route path="intake" element={<Intake />} />
            <Route path="sign" element={<Sign />} />
            <Route path="booking" element={<Booking />} />
            <Route path="portal" element={<Portal />} />
            <Route path="file" element={<MyFile />} />
            <Route path="consult" element={<Consult />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  </StrictMode>,
)
