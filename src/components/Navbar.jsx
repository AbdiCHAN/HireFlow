function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <h1 className="logo">HireFlow</h1>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Saved Jobs</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;