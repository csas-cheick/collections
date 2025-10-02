import React, { useState, useEffect } from "react";

// Pour une meilleure réutilisabilité, on peut passer les images en props.
const defaultImages = [
  "images/modeles/model-1.png", "images/modeles/model-2.png",
  "images/modeles/model-3.png", "images/modeles/model-4.png",
  "images/modeles/model-5.png", "images/modeles/model-6.png",
  "images/modeles/model-7.png", "images/modeles/model-8.png",
  "images/modeles/model-9.png", "images/modeles/model-10.png",
  "images/modeles/model-11.png", "images/modeles/model-12.png",
  "images/modeles/model-13.png", "images/modeles/model-14.png",
  "images/modeles/model-15.png", "images/modeles/model-16.png",
  "images/modeles/model-17.png", "images/modeles/model-18.png",
  "images/modeles/model-19.png", "images/modeles/model-20.png",
  "images/modeles/model-21.png", "images/modeles/model-22.png",
  "images/modeles/model-23.png", "images/modeles/model-24.png",
];

const ITEMS_PER_VIEW = 4;

export default function ModelImageCarousel({ modelImages = defaultImages }) {
  // On suit l'index du premier élément visible, pas la page.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Le carrousel s'arrête de défiler quand le dernier groupe d'images est visible.
  const maxIndex = modelImages.length - ITEMS_PER_VIEW;

  useEffect(() => {
    // S'il n'y a pas assez d'images pour défiler, on ne fait rien.
    if (modelImages.length <= ITEMS_PER_VIEW) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Si on est au dernier index possible, on retourne à 0, sinon on avance de 1.
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000); // Défilement toutes les 3 secondes

    return () => clearInterval(interval);
  }, [maxIndex, modelImages.length]);

  // Calcule la valeur de la translation en pourcentage.
  // Chaque pas déplace le conteneur de la largeur d'UNE seule image.
  const translationValue = `-${currentIndex * (100 / ITEMS_PER_VIEW)}%`;
  
  // Calcule le nombre total de "pages" pour les points de navigation.
  const totalPages = Math.ceil(modelImages.length / ITEMS_PER_VIEW);
  // Le point actif est déterminé par le groupe d'images actuellement visible.
  const activeDotIndex = Math.floor(currentIndex / ITEMS_PER_VIEW);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-lg overflow-hidden h-[310px]">
      {/* En-tête */}
      <div className="px-5 pb-0 pt-5 sm:px-6 sm:pt-6">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Nos Modèles en Vedette ✨
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Découvrez nos créations en défilement continu.
          </p>
        </div>
      </div>

      {/* Carrousel */}
      <div className="relative w-full h-[calc(100%-80px)] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(${translationValue})` }}
        >
          {/* On affiche toutes les images directement dans le conteneur flexible */}
          {modelImages.map((imageSrc, index) => (
            <div
              key={index}
              className="flex-shrink-0 p-2 h-full"
              // Chaque image occupe 1/4 de la largeur du conteneur visible
              style={{ flex: `0 0 ${100 / ITEMS_PER_VIEW}%` }}
            >
              <img
                src={imageSrc}
                alt={`Modèle ${index + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>

        {/* Points de navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`block h-2 rounded-full transition-all duration-300 ${
                index === activeDotIndex
                  ? 'bg-blue-500 w-4'
                  : 'bg-gray-300 dark:bg-gray-600 w-2'
              }`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}