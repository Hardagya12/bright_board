import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Box } from '@mui/material';
import { GraduationCap, School, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.2 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="role-selection-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper className="role-card" elevation={6}>
          <motion.div variants={itemVariants} className="logo-container">
            <Lightbulb className="logo" />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="h3" component="h1" className="role-title">
              Welcome to BrightBoard
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="subtitle1" className="role-subtitle">
              Please select your role to continue
            </Typography>
          </motion.div>
          
          <div className="role-button-container">
            <motion.div variants={itemVariants}>
              <Button 
                variant="contained"
                fullWidth
                className="role-button tutor-button"
                onClick={() => navigate('/a/signup')}
                startIcon={<GraduationCap size={24} className="role-icon" />}
              >
                I am a Tutor
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                variant="contained"
                fullWidth
                className="role-button student-button"
                onClick={() => navigate('/s/signup')}
                startIcon={<School size={24} className="role-icon" />}
              >
                I am a Student
              </Button>
            </motion.div>
          </div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="body2" style={{ color: '#8b95af' }}>
              Choose the option that best describes your role
            </Typography>
          </motion.div>
        </Paper>
      </motion.div>
    </div>
  );
};

export default RoleSelection;