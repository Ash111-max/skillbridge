import React from "react";

const DomainSelector = ({ domains, selected, setSelected }) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Interview Domain</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-slate-800">Select a domain...</option>
        {domains.map((d) => (
          <option key={d} value={d} className="bg-slate-800">
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DomainSelector;