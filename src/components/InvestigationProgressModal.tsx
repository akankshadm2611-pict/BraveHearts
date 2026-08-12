import React, { useState, useEffect } from 'react';
import { Case, User, CaseStatus } from '../types';
import { 
  X, 
  GripVertical, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Lock, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  BarChart2
} from 'lucide-react';

export interface ProgressItem {
  id: string;
  label: string;
  completed: boolean;
  isFixedEnd?: boolean;
}

interface InvestigationProgressModalProps {
  caseItem: Case;
  themeMode: 'bright' | 'dark';
  currentUser: User | null;
  onClose: () => void;
  onUpdateCaseStatus?: (caseId: string, status: Case['status']) => void;
}

const INITIAL_STEPS: Omit<ProgressItem, 'id'>[] = [
  { label: 'Complaint / FIR Registered', completed: true },
  { label: 'Crime Scene Examination', completed: false },
  { label: 'Evidence Collected & Documented', completed: false },
  { label: 'Witness Statements Recorded', completed: false },
  { label: 'Suspect(s) Identified', completed: false },
  { label: 'Suspect Investigation Completed', completed: false },
  { label: 'Forensic / Lab Reports Received', completed: false },
  { label: 'Evidence Correlation Completed', completed: false },
  { label: 'Investigation Report Prepared', completed: false },
  { label: 'Final Review Completed', completed: false, isFixedEnd: true },
];

export const InvestigationProgressModal: React.FC<InvestigationProgressModalProps> = ({
  caseItem,
  themeMode,
  currentUser,
  onClose,
  onUpdateCaseStatus,
}) => {
  // Check user authority: Only DSP and Host can tick/untick or add/reorder items (unless case is Solved)
  const userRole = currentUser?.role;
  const canEditProgress =
    (userRole === 'DSP' || userRole === 'Host' || userRole === 'Host Inspector') &&
    caseItem.status !== 'Solved';

  const localStorageKey = `investigation_progress_${caseItem.id}`;
  const migrationKey = `investigation_progress_v2_${caseItem.id}`;

  const [items, setItems] = useState<ProgressItem[]>(() => {
    let initialList: ProgressItem[] = [];
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed;
        }
      }
    } catch {
      // Fallback
    }

    if (initialList.length === 0) {
      const isSolved = caseItem.status === 'Solved';
      initialList = INITIAL_STEPS.map((step, idx) => ({
        id: `step-${idx + 1}-${Date.now()}`,
        label: step.label,
        completed: isSolved ? true : step.completed,
        isFixedEnd: step.isFixedEnd,
      }));
    }

    // Always guarantee Complaint / FIR Registered is completed/ticked by default
    return initialList.map((item) =>
      item.label === 'Complaint / FIR Registered' ? { ...item, completed: true } : item
    );
  });

  const [newStepLabel, setNewStepLabel] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Save to localStorage when items change
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }, [items, localStorageKey]);

  // Toggle item completed state
  const handleToggle = (id: string) => {
    if (!canEditProgress) return;
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;

      // Lock 'Complaint / FIR Registered' so no one can untick it
      if (target.label === 'Complaint / FIR Registered') {
        return prev;
      }

      const isFinalStep = target.isFixedEnd || target.label === 'Final Review Completed';
      const otherSteps = prev.filter((i) => i.id !== id && !i.isFixedEnd && i.label !== 'Final Review Completed');
      const allPrecedingCompleted = otherSteps.every((i) => i.completed);

      // Block checking "Final Review Completed" if any preceding step is incomplete
      if (isFinalStep && !target.completed && !allPrecedingCompleted) {
        return prev;
      }

      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });

      // If any preceding step was unticked, automatically untick "Final Review Completed"
      const stillAllPrecedingCompleted = updated
        .filter((i) => !i.isFixedEnd && i.label !== 'Final Review Completed')
        .every((i) => i.completed);

      if (!stillAllPrecedingCompleted) {
        return updated.map((i) =>
          i.isFixedEnd || i.label === 'Final Review Completed' ? { ...i, completed: false } : i
        );
      }

      return updated;
    });
  };

  // Add new custom step
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditProgress || !newStepLabel.trim()) return;

    const newItem: ProgressItem = {
      id: `custom-step-${Date.now()}`,
      label: newStepLabel.trim(),
      completed: false,
      isFixedEnd: false,
    };

    setItems((prev) => {
      // Find position of fixed end item if exists
      const fixedEndIdx = prev.findIndex((i) => i.isFixedEnd);
      if (fixedEndIdx !== -1) {
        const copy = [...prev];
        copy.splice(fixedEndIdx, 0, newItem);
        return copy;
      }
      return [...prev, newItem];
    });

    setNewStepLabel('');
  };

  // Remove a custom step
  const handleRemoveStep = (id: string) => {
    if (!canEditProgress) return;
    setItems((prev) =>
      prev.filter((item) => item.id !== id || item.isFixedEnd || item.label === 'Complaint / FIR Registered')
    );
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!canEditProgress || items[index].isFixedEnd) {
      e.preventDefault();
      return;
    }
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!canEditProgress) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!canEditProgress || draggedIndex === null || draggedIndex === dropIndex) return;

    // Do not allow moving onto or after fixed end item
    const fixedIndex = items.findIndex((i) => i.isFixedEnd);
    let targetIndex = dropIndex;
    if (fixedIndex !== -1 && targetIndex >= fixedIndex) {
      targetIndex = fixedIndex - 1;
    }
    if (targetIndex < 0) targetIndex = 0;

    const copy = [...items];
    const [removed] = copy.splice(draggedIndex, 1);
    copy.splice(targetIndex, 0, removed);

    // Ensure fixed item stays at the very end
    const finalFixedIdx = copy.findIndex((i) => i.isFixedEnd);
    if (finalFixedIdx !== -1 && finalFixedIdx !== copy.length - 1) {
      const [fixedItem] = copy.splice(finalFixedIdx, 1);
      copy.push(fixedItem);
    }

    setItems(copy);
    setDraggedIndex(null);
  };

  // Move item up/down with buttons
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!canEditProgress || items[index].isFixedEnd) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0) return;
    if (items[targetIdx]?.isFixedEnd) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setItems(copy);
  };

  // Progress percentage calculation
  const totalItems = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const perItemPercentage = totalItems > 0 ? (100 / totalItems).toFixed(1) : '0';

  // Dynamic status update based on checked investigation steps
  useEffect(() => {
    if (!onUpdateCaseStatus) return;

    const isFinalStepChecked = items.some(
      (i) => (i.isFixedEnd || i.label === 'Final Review Completed') && i.completed
    );

    let targetStatus: CaseStatus = 'Pending';

    if (isFinalStepChecked) {
      targetStatus = 'Solved';
    } else if (completedCount >= 4) {
      targetStatus = 'Active';
    } else if (completedCount === 2 || completedCount === 3) {
      targetStatus = 'Under Investigation';
    } else {
      // Only 1 checkbox ticked (default Complaint/FIR Registered)
      targetStatus = 'Pending';
    }

    if (caseItem.status !== targetStatus) {
      onUpdateCaseStatus(caseItem.id, targetStatus);
    }
  }, [items, completedCount, caseItem.id, caseItem.status, onUpdateCaseStatus]);

  // Dynamic progress color (Red -> Yellow -> Green)
  const getProgressColorClasses = (pct: number) => {
    if (pct <= 35) {
      return {
        bar: 'bg-gradient-to-r from-red-600 to-rose-500',
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
      };
    }
    if (pct <= 70) {
      return {
        bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      };
    }
    return {
      bar: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    };
  };

  const colors = getProgressColorClasses(percentage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl my-auto rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          themeMode === 'bright'
            ? 'bg-white text-slate-900 border-sky-300 shadow-sky-500/10'
            : 'bg-slate-950 text-slate-100 border-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-sky-200 text-blue-950 shadow-sm'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl border ${
                themeMode === 'bright'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950'
                  }`}
                >
                  #{caseItem.id}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {caseItem.crimeType}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    caseItem.status === 'Solved'
                      ? themeMode === 'bright'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : caseItem.status === 'Under Investigation'
                      ? themeMode === 'bright'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      : caseItem.status === 'Active'
                      ? themeMode === 'bright'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                      : themeMode === 'bright'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }`}
                >
                  ● {caseItem.status}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black leading-tight tracking-tight mt-0.5">
                INVESTIGATION PROGRESS
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-white hover:bg-slate-200 text-blue-950 border border-slate-300 shadow-xs'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Close Progress View"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Authority Status Banner */}
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
            canEditProgress
              ? themeMode === 'bright'
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-blue-950/40 text-blue-300 border-blue-900/40'
              : themeMode === 'bright'
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {canEditProgress ? (
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
            <span className="font-semibold">
              {caseItem.status === 'Solved'
                ? `🔒 Case is Solved: Investigation progress bar and steps are locked and non-editable.`
                : canEditProgress
                ? `Authorized as ${userRole}: You can toggle checkboxes, add steps, and reorder items.`
                : `View Only Mode (${userRole}): Only DSP and Host Officers can mark progress steps.`}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold hidden sm:inline">
            Equal Share: ~{perItemPercentage}% / step
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add Custom Step (DSP / Host only) */}
          {canEditProgress && (
            <form onSubmit={handleAddStep} className="flex gap-2">
              <input
                type="text"
                value={newStepLabel}
                onChange={(e) => setNewStepLabel(e.target.value)}
                placeholder="Add custom investigation feature/step..."
                className={`flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none transition-all ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white'
                    : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400'
                }`}
              />
              <button
                type="submit"
                disabled={!newStepLabel.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  themeMode === 'bright'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature</span>
              </button>
            </form>
          )}

          {/* List of Investigation Progress Items */}
          <div
            className={`rounded-2xl border divide-y overflow-hidden shadow-xs ${
              themeMode === 'bright'
                ? 'bg-white border-slate-200 divide-slate-100'
                : 'bg-slate-900/60 border-slate-800 divide-slate-800/60'
            }`}
          >
            {items.map((item, index) => {
              const isFixed = !!item.isFixedEnd;
              const isFirRegistered = item.label === 'Complaint / FIR Registered';
              const itemShare = (100 / totalItems).toFixed(0);

              const isFinalStep = isFixed || item.label === 'Final Review Completed';
              const precedingSteps = items.filter((i) => !i.isFixedEnd && i.label !== 'Final Review Completed');
              const allPrecedingCompleted = precedingSteps.every((i) => i.completed);
              const isFinalStepBlocked = isFinalStep && !item.completed && !allPrecedingCompleted;

              return (
                <div
                  key={item.id}
                  draggable={canEditProgress && !isFixed && !isFirRegistered}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                    item.completed
                      ? themeMode === 'bright'
                        ? 'bg-sky-50/50'
                        : 'bg-slate-900/90'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  } ${draggedIndex === index ? 'opacity-40 border-2 border-dashed border-blue-500' : ''}`}
                >
                  {/* Left: Drag Handle + Checkbox + Label */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Drag handle */}
                    {canEditProgress && !isFixed && !isFirRegistered ? (
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-4 flex items-center justify-center">
                        {isFirRegistered && (
                          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" title="Initial FIR step locked" />
                        )}
                      </div>
                    )}

                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => !isFirRegistered && handleToggle(item.id)}
                      disabled={!canEditProgress || isFinalStepBlocked || isFirRegistered}
                      className={`flex-shrink-0 focus:outline-none transition-transform ${
                        isFirRegistered
                          ? 'cursor-not-allowed opacity-90'
                          : canEditProgress && !isFinalStepBlocked
                          ? 'hover:scale-110 active:scale-95 cursor-pointer'
                          : 'cursor-not-allowed opacity-50'
                      }`}
                      title={
                        isFirRegistered
                          ? 'Complaint / FIR Registered is mandatory and cannot be unticked'
                          : !canEditProgress
                          ? 'Only DSP & Host can change status'
                          : isFinalStepBlocked
                          ? 'Complete all preceding investigation steps to enable Final Review'
                          : 'Toggle completion'
                      }
                    >
                      {item.completed ? (
                        <CheckSquare
                          className={`w-5 h-5 ${
                            themeMode === 'bright' ? 'text-blue-600' : 'text-emerald-400'
                          }`}
                        />
                      ) : (
                        <Square
                          className={`w-5 h-5 ${
                            isFinalStepBlocked
                              ? 'text-slate-300 dark:text-slate-700'
                              : themeMode === 'bright'
                              ? 'text-slate-400'
                              : 'text-slate-600'
                          }`}
                        />
                      )}
                    </button>

                    {/* Statement label */}
                    <span
                      onClick={() => !isFirRegistered && !isFinalStepBlocked && handleToggle(item.id)}
                      className={`text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap block flex-1 min-w-0 py-0.5 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                        isFirRegistered
                          ? 'cursor-not-allowed'
                          : canEditProgress && !isFinalStepBlocked
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed opacity-75'
                      } ${
                        item.completed
                          ? themeMode === 'bright'
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-100 font-bold'
                          : isFinalStepBlocked
                          ? 'text-slate-400 dark:text-slate-500 italic'
                          : themeMode === 'bright'
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                      title={
                        isFirRegistered
                          ? 'Complaint / FIR Registered is mandatory'
                          : isFinalStepBlocked
                          ? 'Complete all preceding investigation steps to enable Final Review'
                          : undefined
                      }
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Right: Controls & Percentage Share */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Badge showing percentage weight */}
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        item.completed
                          ? colors.badge
                          : themeMode === 'bright'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {itemShare}%
                    </span>

                    {/* Badge for Fixed Item */}
                    {isFixed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
                        Final Step
                      </span>
                    )}

                    {/* Move Up/Down buttons if editable */}
                    {canEditProgress && !isFixed && !isFirRegistered && (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move step up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === totalItems - 2 || items[index + 1]?.isFixedEnd}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move step down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Delete Custom / Extra step */}
                    {canEditProgress && !isFixed && !isFirRegistered && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide Progress Bar & Color Indicator */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-200 shadow-xs'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className={`w-4 h-4 ${colors.text}`} />
                <span className="text-xs font-black tracking-wide uppercase">
                  INVESTIGATION PROGRESS
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-black ${colors.text}`}>
                  {percentage}%
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({completedCount}/{totalItems} steps)
                </span>
              </div>
            </div>

            {/* Progress Slide Bar Track */}
            <div
              className={`w-full h-4 rounded-full overflow-hidden p-0.5 border ${
                themeMode === 'bright'
                  ? 'bg-slate-200 border-slate-300'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* ASCII style progress indicator preview */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              <span>
                Progress: <strong className={colors.text}>{percentage}%</strong>
              </span>
              <span className="font-bold">
                {percentage === 100
                  ? '✓ 100% Investigation Ready for Final Review'
                  : `${100 - percentage}% remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className={`text-xs font-medium ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
            Completed <strong>{completedCount}</strong> of <strong>{totalItems}</strong> features
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Close Progress View
          </button>
        </div>
      </div>
    </div>
  );
};
