function CategoryCard({ icon, title, jobs }) {
  return (
    <div className="category-card">
      <div className="category-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{jobs} jobs</p>
    </div>
  );
}

export default CategoryCard;