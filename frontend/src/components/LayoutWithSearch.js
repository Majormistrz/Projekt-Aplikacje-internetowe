import React from "react";
import Layout from "./Layout";
import SearchBar from "./SearchBar";
import Footer from "./Footer";

const LayoutWithSearch = () => {
  return (
    <>
      <Layout>
        <div className="bg-light py-3">
          <div className="container d-flex justify-content-center">
            <SearchBar />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LayoutWithSearch;
