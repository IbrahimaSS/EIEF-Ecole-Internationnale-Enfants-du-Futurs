import React from 'react';
import ManagerScolarite from '../manager/Scolarite';

const CoordinatorScolarite: React.FC = () => {
  return <ManagerScolarite allowCatalogManagement={false} allowStudentCards />;
};

export default CoordinatorScolarite;