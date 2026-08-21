import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { branchService } from "@/lib/services/branchService";

export function BranchSelector() {
  const { session, switchBranch } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const allBranches = await branchService.getBranchesV2();
      const companyBranches: any[] = allBranches.filter(
        (b: any) => {
          const bCompId = String(b.CompanyID || b.companyId || '').trim();
          const sessCompId = String(session?.companyID || '').trim();
          const isMatch = !sessCompId || sessCompId === 'ALL' || bCompId === sessCompId;
          const status = String(b.Status || b.status || 'Active').trim().toUpperCase();
          const isActive = status === 'ACTIVE';
          return isMatch && isActive;
        }
      );
      setBranches(companyBranches);

      // If no branch is selected or selected branch is not in the list, auto-select the first one
      if (
        companyBranches.length > 0 &&
        (!session?.branchID || session?.branchID === "ALL")
      ) {
        switchBranch(
          companyBranches[0].BranchID || companyBranches[0].id,
          companyBranches[0].BranchName || companyBranches[0].branchName,
        );
      } else if (
        !session?.branchName &&
        session?.branchID &&
        session?.branchID !== "ALL"
      ) {
        const current = companyBranches.find(
          (b) => b.BranchID === session.branchID || b.id === session.branchID,
        );
        if (current) {
          switchBranch(
            session.branchID,
            current.BranchName || current.branchName,
          );
        }
      }
    } catch (e) {
      console.error("Failed to load branches", e);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (session?.role === "COMPANY_ADMIN") {
      loadBranches();
    }
  }, [session?.companyID, session?.role]);

  

  if (session?.role !== "COMPANY_ADMIN") return null;

  return (
    <div className="mb-4 bg-[#0F172A] border border-white/10 rounded-xl p-3 flex flex-col gap-2">
      <div className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between items-center">
        <span>COMPANY ADMIN</span>
        {loading && <span className="animate-pulse text-cyan-500">...</span>}
      </div>
      <div className="text-xs text-white/70">Active Branch:</div>
      <select
        value={session?.branchID || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'ALL') {
             switchBranch('ALL', 'All Branches');
             return;
          }
          const b = branches.find(
            (br) => br.BranchID === val || br.id === val,
          );
          if (b) switchBranch(b.BranchID || b.id, b.BranchName || b.branchName);
        }}
        className="w-full bg-[#1E293B] border border-white/10 rounded-lg py-2 px-3 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 uppercase tracking-wider"
      >
        <option value="ALL">ALL BRANCHES</option>
        {branches.map((b) => (
          <option key={b.BranchID || b.id} value={b.BranchID || b.id}>
            {b.BranchName || b.branchName || b.BranchID || b.id}
          </option>
        ))}
      </select>
    </div>
  );
}
