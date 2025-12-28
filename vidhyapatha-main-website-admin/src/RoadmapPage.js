import React, { useState, useEffect } from "react";

export default function RoadmapPage({ career, onBack }) {
  // Initialize roadmap: if career is new, levels are empty
  const [roadmap, setRoadmap] = useState({});

  useEffect(() => {
    // On career change, create empty levels if they don’t exist
    setRoadmap({
      Beginner: [],
      Intermediate: [],
      Advanced: [],
    });
  }, [career]);

  const [editingNode, setEditingNode] = useState(null);
  const [newNode, setNewNode] = useState({ title: "", shortDesc: "", desc: "", doc: "", video: "" });

  // Add node
  const addNode = (level) => {
    if (!newNode.title || !newNode.desc) return;
    setRoadmap({
      ...roadmap,
      [level]: [...roadmap[level], { id: Date.now(), ...newNode }],
    });
    setNewNode({ title: "", shortDesc: "", desc: "", doc: "", video: "" });
  };

  // Update node
  const updateNode = (level) => {
    setRoadmap({
      ...roadmap,
      [level]: roadmap[level].map((n) => (n.id === editingNode.id ? editingNode : n)),
    });
    setEditingNode(null);
  };

  // Delete node
  const deleteNode = (level, id) => {
    setRoadmap({
      ...roadmap,
      [level]: roadmap[level].filter((n) => n.id !== id),
    });
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl mt-6 relative">
      {/* X Button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white bg-gray-600 rounded-full hover:bg-gray-700"
      >
        X
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {career.title} – Roadmap
      </h2>

      {Object.keys(roadmap).map((level) => (
        <div key={level} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">{level}</h3>

          {/* Nodes */}
          <div className="flex flex-wrap gap-4">
            {roadmap[level].map((node) => (
              <div
                key={node.id}
                className="p-4 w-64 bg-white shadow rounded-lg border"
              >
                {editingNode?.id === node.id ? (
                  <>
                    <input
                      type="text"
                      value={editingNode.title}
                      onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                      placeholder="Title"
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <textarea
                      value={editingNode.shortDesc}
                      onChange={(e) => setEditingNode({ ...editingNode, shortDesc: e.target.value })}
                      placeholder="Short Description"
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <textarea
                      value={editingNode.desc}
                      onChange={(e) => setEditingNode({ ...editingNode, desc: e.target.value })}
                      placeholder="Description"
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                      type="text"
                      value={editingNode.doc}
                      onChange={(e) => setEditingNode({ ...editingNode, doc: e.target.value })}
                      placeholder="Documentation Link"
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <input
                      type="text"
                      value={editingNode.video}
                      onChange={(e) => setEditingNode({ ...editingNode, video: e.target.value })}
                      placeholder="Video Link"
                      className="border px-2 py-1 rounded w-full mb-2"
                    />
                    <button
                      onClick={() => updateNode(level)}
                      className="px-2 py-1 bg-blue-600 text-white rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNode(null)}
                      className="px-2 py-1 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-gray-800">{node.title}</h4>
                    {node.shortDesc && (
                      <p className="text-sm text-gray-700 mb-1">{node.shortDesc}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">{node.desc}</p>
                    {node.doc && (
                      <a href={node.doc} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline block">
                        Documentation
                      </a>
                    )}
                    {node.video && (
                      <a href={node.video} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline block">
                        Video
                      </a>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setEditingNode(node)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNode(level, node.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add Node */}
          <div className="mt-4 flex flex-col gap-2 bg-gray-100 p-3 rounded-lg">
            <input
              type="text"
              placeholder="Title"
              value={newNode.title}
              onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
              className="border px-2 py-1 rounded"
            />
            <textarea
              placeholder="Short Description"
              value={newNode.shortDesc}
              onChange={(e) => setNewNode({ ...newNode, shortDesc: e.target.value })}
              className="border px-2 py-1 rounded"
            />
            <textarea
              placeholder="Description"
              value={newNode.desc}
              onChange={(e) => setNewNode({ ...newNode, desc: e.target.value })}
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Documentation Link"
              value={newNode.doc}
              onChange={(e) => setNewNode({ ...newNode, doc: e.target.value })}
              className="border px-2 py-1 rounded"
            />
            <input
              type="text"
              placeholder="Video Link"
              value={newNode.video}
              onChange={(e) => setNewNode({ ...newNode, video: e.target.value })}
              className="border px-2 py-1 rounded"
            />
            <button
              onClick={() => addNode(level)}
              className="px-3 py-1 bg-green-600 text-white rounded mt-2"
            >
              Add {level} Step
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
