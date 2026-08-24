import ItemCard from "./ItemCard";

const ItemsGrid = () => {
  const items = [
    {
      id: 1,
      category: "money",
      title: "USD Bills",
      description:
        "Found $120 in mixed bills near the fountain in Central Park.",
      image:
        "https://i.pinimg.com/1200x/d3/33/cb/d333cbf849b0555ffcd283f2f9b6b9c2.jpg",
      location: "Central Park, NY",
      date: "Aug 10, 2026",
    },
    {
      id: 2,
      category: "passport",
      title: "Canadian Passport",
      description:
        "Found a Canadian passport near the airport baggage claim.",
      image:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop",
      location: "LAX Terminal 4",
      date: "Aug 9, 2026",
    },
    {
      id: 3,
      category: "phone",
      title: "iPhone 15 Pro",
      description:
        "Found an iPhone with a blue case in the food court.",
      image:
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=300&fit=crop",
      location: "Westfield Mall",
      date: "Aug 8, 2026",
    },
    {
      id: 4,
      category: "wallet",
      title: "Black Wallet",
      description:
        "Found a black wallet near the shopping center entrance.",
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
      location: "Shopping Center",
      date: "Aug 7, 2026",
    },
     {
      id: 5,
      category: "money",
      title: "USD Bills",
      description:
        "Found $120 in mixed bills near the fountain in Central Park.",
      image:
        "https://i.pinimg.com/1200x/d3/33/cb/d333cbf849b0555ffcd283f2f9b6b9c2.jpg",
      location: "Central Park, NY",
      date: "Aug 10, 2026",
    },
    {
      id: 6,
      category: "passport",
      title: "Canadian Passport",
      description:
        "Found a Canadian passport near the airport baggage claim.",
      image:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop",
      location: "LAX Terminal 4",
      date: "Aug 9, 2026",
    },
    {
      id: 7,
      category: "phone",
      title: "iPhone 15 Pro",
      description:
        "Found an iPhone with a blue case in the food court.",
      image:
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&h=300&fit=crop",
      location: "Westfield Mall",
      date: "Aug 8, 2026",
    },
    {
      id: 8,
      category: "wallet",
      title: "Black Wallet",
      description:
        "Found a black wallet near the shopping center entrance.",
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
      location: "Shopping Center",
      date: "Aug 7, 2026",
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          image={item.image}
          category={item.category}
          title={item.title}
          description={item.description}
          location={item.location}
          date={item.date}
        />
      ))}
    </div>
  );
};

export default ItemsGrid;