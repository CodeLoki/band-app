import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { LuArrowBigDown, LuArrowBigUp, LuTrash2, LuX } from 'react-icons/lu';

interface ShoppingCartProps<T> {
    /** All items. */
    allItems: T[];
    /** Selected items. */
    selectedItems?: T[];
    /** Form input name for the hidden inputs */
    name: string;
    /** Which field to use as the label */
    labelField: keyof T;
    /** Callback when selected items change */
    onChange: (items: T[]) => void;
}

function Basket({ children }: React.PropsWithChildren) {
    return (
        <div className="card bg-base-100 relative">
            <div className="card-body p-3">
                <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto pb-4 mask-b-from-90%">{children}</div>
            </div>
        </div>
    );
}

function ToolbarButton({
    fn,
    disabled,
    text,
    Icon
}: {
    fn: VoidFunction;
    disabled: boolean;
    text: string;
    Icon: IconType;
}) {
    return (
        <button
            type="button"
            onClick={fn}
            disabled={disabled}
            className={`tooltip tooltip-left ${disabled ? 'text-base-content/30' : 'text-primary'}`}
            data-tip={text}
        >
            <Icon className="h-5 w-5" />
        </button>
    );
}

/**
 * A shopping cart component for selecting and managing items.
 */
export default function ShoppingCart<T extends { id: string }>({
    allItems,
    selectedItems: initialSelectedItems = [],
    name,
    labelField,
    onChange
}: ShoppingCartProps<T>) {
    const [selectedItems, setSelectedItems] = useState<T[]>(initialSelectedItems);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    // Initialize state with provided initial items
    useEffect(() => {
        setSelectedItems(initialSelectedItems);
    }, [initialSelectedItems]);

    // Helper function to update selected items
    const updateSelectedItems = useCallback(
        (newItems: T[]) => {
            setSelectedItems(newItems);
            onChange(newItems);
        },
        [onChange]
    );

    const handleAddItem = useCallback(
        (item: T) => {
            updateSelectedItems([...selectedItems, item]);
        },
        [selectedItems, updateSelectedItems]
    );

    const handleRemoveItem = useCallback(
        (itemId: string | null) => {
            if (!itemId) return;

            updateSelectedItems(selectedItems.filter((item) => item.id !== itemId));
            setActiveItemId(null);
        },
        [selectedItems, updateSelectedItems]
    );

    const handleMove = useCallback(
        (index: number, direction: -1 | 1) => {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= selectedItems.length) return;

            const newItems = [...selectedItems];
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
            updateSelectedItems(newItems);
        },
        [selectedItems, updateSelectedItems]
    );

    const handleClearAll = useCallback(() => {
        updateSelectedItems([]);
        setActiveItemId(null);
    }, [updateSelectedItems]);

    const handleSelectItem = useCallback(
        (itemId: string) => {
            setActiveItemId(activeItemId === itemId ? null : itemId);
        },
        [activeItemId]
    );

    const activeItemIndex = selectedItems.findIndex((item) => item.id === activeItemId);

    return (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 min-h-[250px]">
            {/* Hidden inputs for form submission */}
            {selectedItems.map((item, index) => (
                <input key={`${item.id}-${index}`} type="hidden" name={name} value={String(item.id)} />
            ))}

            {/* Available Items */}
            <Basket>
                {allItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="badge badge-sm rounded-md cursor-pointer badge-soft bg-neutral hover:badge-primary transition-colors"
                    >
                        {item[labelField] as string}
                    </button>
                ))}
            </Basket>

            {/* Selected Items */}
            <Basket>
                {selectedItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item.id)}
                        className={`badge badge-sm rounded-md cursor-pointer transition-colors ${
                            activeItemId === item.id
                                ? 'badge-primary bg-primary/10 border-primary text-primary'
                                : 'badge-outline hover:badge-primary'
                        }`}
                    >
                        {item[labelField] as string}
                    </button>
                ))}
            </Basket>

            {/* Toolbar */}
            <ul className="menu bg-base-200 rounded-box h-full flex flex-col">
                <li>
                    <ToolbarButton
                        fn={() => {
                            handleMove(activeItemIndex, -1);
                        }}
                        text="Move Up"
                        Icon={LuArrowBigUp}
                        disabled={activeItemId === null || activeItemIndex <= 0}
                    />
                </li>
                <li>
                    <ToolbarButton
                        fn={() => {
                            handleMove(activeItemIndex, 1);
                        }}
                        text="Move Down"
                        Icon={LuArrowBigDown}
                        disabled={activeItemId === null || activeItemIndex >= selectedItems.length - 1}
                    />
                </li>
                <li>
                    <ToolbarButton
                        fn={() => {
                            handleRemoveItem(activeItemId);
                        }}
                        text="Remove"
                        Icon={LuX}
                        disabled={activeItemId === null}
                    />
                </li>
                <li className="flex-1 bg-transparent"></li>
                <li className="mt-auto">
                    <ToolbarButton
                        fn={() => {
                            handleClearAll();
                        }}
                        text="Clear All"
                        Icon={LuTrash2}
                        disabled={selectedItems.length === 0}
                    />
                </li>
            </ul>
        </div>
    );
}
