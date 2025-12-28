import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const booksData = [
  {
    id: "1",
    title: "Learn Java",
    description: "A complete Java guide for beginners.",
    data: "/ebooks/java.pdf"   // put your file inside public/ebooks/
  },
  {
    id: "2",
    title: "Python Basics",
    description: "Start learning Python with simple examples.",
    data: "/ebooks/python.pdf"
  }
  // Add more books here
];

export default function EBooksCategory() {
  const { id } = useParams();
  const book = booksData.find((b) => b.id === id);

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
  };

  if (!book) {
    return (
      <p className="p-8 text-lg text-red-500">
        ❌ Book not found.
      </p>
    );
  }

  return (
    <motion.div
      className="p-8 max-w-3xl mx-auto"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        📖 {book.title}
      </h1>

      {book.description && (
        <p className="mb-6 text-gray-700">
          <span className="font-semibold">Description:</span> {book.description}
        </p>
      )}

      <a
        href={book.data}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold rounded-lg shadow hover:from-green-700 hover:to-green-500 transition"
      >
        📥 Open Book
      </a>
    </motion.div>
  );
}
