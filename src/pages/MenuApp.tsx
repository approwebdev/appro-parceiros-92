import { useState } from "react";
import MenuDigital from "./MenuDigital";
import MenuCategories from "./MenuCategories";
import MenuTreatment from "./MenuTreatment";

type PageType = 'home' | 'categories' | 'treatment';

const MenuApp = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');

  const handleEnter = () => {
    setCurrentPage('categories');
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const handleCategorySelect = (category: string) => {
    // Por enquanto, vou buscar o primeiro tratamento dessa categoria
    // Aqui você pode implementar a lógica para mostrar tratamentos da categoria
    setSelectedTreatment('first-treatment'); // Placeholder
    setCurrentPage('treatment');
  };

  const handleTreatmentBack = () => {
    setCurrentPage('categories');
  };

  return (
    <div className="menu-container">
      <div className={`menu-page ${currentPage === 'home' ? 'active' : 'prev'}`}>
        <MenuDigital onEnter={handleEnter} />
      </div>
      
      <div className={`menu-page ${currentPage === 'categories' ? 'active' : currentPage === 'home' ? 'next' : 'prev'}`}>
        <MenuCategories onBack={handleBack} onCategorySelect={handleCategorySelect} />
      </div>
      
      <div className={`menu-page ${currentPage === 'treatment' ? 'active' : 'next'}`}>
        <MenuTreatment onBack={handleTreatmentBack} treatmentId={selectedTreatment} />
      </div>
    </div>
  );
};

export default MenuApp;