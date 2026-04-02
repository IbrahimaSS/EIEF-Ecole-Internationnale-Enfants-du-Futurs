import React from 'react';
import { motion } from 'framer-motion';

const EnseignantDashboard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <h1 className="text-2xl font-semibold">Espace Enseignant</h1>
      <p className="text-gray-600 mt-2">Gérez vos classes et vos cours</p>
    </motion.div>
  );
};

export default EnseignantDashboard;
