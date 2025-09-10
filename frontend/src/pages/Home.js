import React from "react";
import CategorySection from "./CategorySection";

const Home = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Kategorie produktów</h2>

      {/* Sekcje kategorii */}
      <CategorySection categoryId={1} title="📱 Elektronika" moreLink="/category/1" />
      <CategorySection categoryId={2} title="🛠️ Narzędzia budowlane" moreLink="/category/2" />
      <CategorySection categoryId={3} title="🎮 Gry" moreLink="/category/3" />
      <CategorySection categoryId={4} title="📚 Książki" moreLink="/category/4" />
    </div>
  );
};

export default Home;
