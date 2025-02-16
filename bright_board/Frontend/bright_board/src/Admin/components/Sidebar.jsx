import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/brightboardlogo.webp';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  People,
  EventNote,
  Book,
  Assignment,
  Assessment,
  Payment,
  Feedback,
  Support,
  Settings,
  ExitToApp,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import './Sidebar.css';

const menuItems = [
  { name: 'Dashboard', icon: Dashboard, path: '/dashboard' },
  { name: 'Students', icon: People, path: '/students' },
  { name: 'Attendance', icon: EventNote, path: '/attendance' },
  { name: 'Study Materials', icon: Book, path: '/materials' },
  { name: 'Exams', icon: Assignment, path: '/exams' },
  { name: 'Results', icon: Assessment, path: '/results' },
  { name: 'Payments', icon: Payment, path: '/payments' },
  { name: 'Feedback', icon: Feedback, path: '/feedback' },
  { name: 'Support', icon: Support, path: '/support' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <React.Fragment>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        classes={{ paper: `sidebar ${open ? 'open' : ''}` }}
        sx={{ zIndex: 1000 }}
      >
        <div className="sidebar-header">
          <img src={logo} alt="Bright Board Logo" className="logo" />
          <IconButton onClick={handleDrawerToggle} className="toggle-btn">
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <Tooltip key={item.name} title={open ? '' : item.name} placement="right">
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.name} className={open ? '' : 'item-text-hidden'} />
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
        <List>
          <Tooltip title={open ? '' : 'Logout'} placement="right">
            <ListItem button onClick={() => handleNavigation('/logout')} className="menu-item logout">
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" className={open ? '' : 'item-text-hidden'} />
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>
      {isMobile && (
        <IconButton
          style={{
            position: 'fixed',
            zIndex: 1000,
            left: 16,
            top: 16,
            display: open ? 'none' : 'block',
          }}
          onClick={handleDrawerToggle}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      )}
    </React.Fragment>
  );
};

export default Sidebar;