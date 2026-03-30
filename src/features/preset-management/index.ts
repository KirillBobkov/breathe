/**
 * Preset Management Feature
 *
 * Components for managing breathing exercise presets including:
 * - List and display of all presets
 * - Creating and editing presets
 * - Managing breathing phases
 *
 * @example
 * ```tsx
 * import { PresetList, PresetEditor } from '@/features/preset-management';
 *
 * function App() {
 *   const [isEditing, setIsEditing] = useState(false);
 *   const presets = useBreathingStore((state) => state.presets);
 *
 *   return (
 *     <>
 *       <PresetList
 *         presets={presets}
 *         activePresetId={activePresetId}
 *         onSelect={selectPreset}
 *         onDelete={deletePreset}
 *         onCreate={() => setIsEditing(true)}
 *       />
 *       {isEditing && (
 *         <PresetEditor
 *           onSave={handleSave}
 *           onCancel={() => setIsEditing(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

// Main components
export { PresetList } from './PresetList';
export type { PresetListProps } from './PresetList';

export { PresetItem } from './PresetItem';
export type { PresetItemProps } from './PresetItem';

export { PresetEditor } from './PresetEditor';
export type { PresetEditorProps } from './PresetEditor';

export { PhaseEditor } from './PhaseEditor';
export type { PhaseEditorProps } from './PhaseEditor';

export { PhaseItem } from './PhaseItem';
export type { PhaseItemProps } from './PhaseItem';
