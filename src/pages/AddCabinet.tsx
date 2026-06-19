import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AddCabinetWizard } from "@/components/add-cabinet/AddCabinetWizard";

const AddCabinet = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    // Navigate to dashboard with the new cabinet selected
    navigate("/dashboard", { 
      state: { 
        tab: "cabinets",
        newCabinetCreated: true 
      } 
    });
  };

  const handleCancel = () => {
    navigate("/dashboard", { state: { tab: "cabinets" } });
  };

  return (
    <div 
      className={`min-h-[100dvh] bg-background transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <AddCabinetWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddCabinet;
