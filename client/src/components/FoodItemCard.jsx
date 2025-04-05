import React from 'react';
import './FoodItemCard.css';

function FoodItemCard({ item }) {
  return (
    <div className="food-card">
      <h3 className="food-name">{item.name}</h3>
      <div className="food-details">
        <p><strong>Volume:</strong> {item.volume_ml.toFixed(0)} mL</p>
        <p><strong>Weight:</strong> {item.weight_g.toFixed(0)} g</p>
        <p><strong>Density:</strong> {item.density.toFixed(2)} g/mL</p>
        <p><strong>Calories:</strong> {item.calories.toFixed(0)} kcal</p>
        <p><strong>Protein:</strong> {item.protein.toFixed(1)} g</p>
        <p><strong>Carbs:</strong> {item.carbs.toFixed(1)} g</p>
        <p><strong>Fat:</strong> {item.fat.toFixed(1)} g</p>
      </div>
    </div>
  );
}

export default FoodItemCard;
