import React, { useState } from 'react';

const Wishlist = ({ initialWishlist, onSave }) => {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(wishlist);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <>
          <textarea
            className="w-full p-3 rounded-md bg-black/20 border border-transparent focus:border-purple-400 focus:outline-none min-h-[120px]"
            value={wishlist}
            onChange={(e) => setWishlist(e.target.value)}
          />
          <button
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </>
      ) : (
        <div
          className="bg-black/20 p-3 rounded-md min-h-[80px] cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          {wishlist}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
