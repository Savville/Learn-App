export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="loader-ball"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <style>{`
        .loader-ball {
          display: block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          animation: ballBounce 0.9s ease-in-out infinite, colorShift 2.5s linear infinite;
        }

        @keyframes ballBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-22px); }
        }

        @keyframes colorShift {
          0%   { background-color: #16a34a; }   /* green-600  */
          20%  { background-color: #0ea5e9; }   /* sky-500    */
          40%  { background-color: #8b5cf6; }   /* violet-500 */
          60%  { background-color: #f59e0b; }   /* amber-500  */
          80%  { background-color: #ef4444; }   /* red-500    */
          100% { background-color: #16a34a; }
        }
      `}</style>
    </div>
  );
}
