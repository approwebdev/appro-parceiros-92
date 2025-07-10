import { useState } from "react";
import MenuDigital from "./MenuDigital";
import MenuCategories from "./MenuCategories";
import MenuTreatmentList from "./MenuTreatmentList";
import MenuTreatment from "./MenuTreatment";

type PageType = 'home' | 'categories' | 'treatmentList' | 'treatment';

const MenuApp = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');

  const handleEnter = () => {
    setCurrentPage('categories');
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  const handleCategorySelect = (category: string, categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage('treatmentList');
  };

  const handleTreatmentListBack = () => {
    setCurrentPage('categories');
  };

  const handleTreatmentSelect = (treatmentId: string) => {
    setSelectedTreatment(treatmentId);
    setCurrentPage('treatment');
  };

  const handleTreatmentBack = () => {
    setCurrentPage('treatmentList');
  };

  return (
    <div className="menu-container">
      <div className={`menu-page ${currentPage === 'home' ? 'active' : 'prev'}`}>
        <MenuDigital onEnter={handleEnter} />
      </div>
      
      <div className={`menu-page ${currentPage === 'categories' ? 'active' : currentPage === 'home' ? 'next' : 'prev'}`}>
        <MenuCategories onBack={handleBack} onCategorySelect={handleCategorySelect} />
      </div>
      
      <div className={`menu-page ${currentPage === 'treatmentList' ? 'active' : currentPage === 'categories' ? 'next' : 'prev'}`}>
        <MenuTreatmentList 
          onBack={handleTreatmentListBack} 
          onTreatmentSelect={handleTreatmentSelect}
          selectedCategory={selectedCategory}
        />
      </div>
      
      <div className={`menu-page ${currentPage === 'treatment' ? 'active' : 'next'}`}>
        <MenuTreatment onBack={handleTreatmentBack} treatmentId={selectedTreatment} />
      </div>
    </div>
  );
};

export default MenuApp;