import { useEffect, useState } from "react";
import { Publication } from "../App";

interface UserRecommendationsProps {
  userId: number;
  onViewDetails: (id: string) => void;
}

export function UserRecommendations({
  userId,
  onViewDetails,
}: UserRecommendationsProps) {
  const [items, setItems] = useState<
    (Publication & { score?: number; reasons?: string[] })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:4000/api/recommendations/user/${userId}`,
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [userId]);

  if (loading) return <div className="p-6">Loading recommendations...</div>;
  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (items.length === 0)
    return (
      <div className="p-6">
        No recommendations yet. View or like a few publications.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl mb-4">Recommendations for you</h2>
      <div className="grid gap-4">
        {items.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-600">
                  {p.authors} — {p.year}
                </p>
                <p className="text-sm text-gray-600">{p.publicationType}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Keywords: {p.keywords}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Score: {p.score ?? 0}
                </div>
                <button
                  onClick={() => onViewDetails(p.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
                >
                  View
                </button>
              </div>
            </div>
            {p.reasons && p.reasons.length > 0 && (
              <div className="mt-3 text-sm text-gray-700">
                <strong>Reasons:</strong> {p.reasons.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
