// app_movil/src/components/ui/overlays/drawer.tsx
 
import React from 'react';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from './sheet';
 
// Drawer in mobile = bottom sheet, so we reuse Sheet
interface DrawerProps { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }
 
export function Drawer({ open, onOpenChange, children }: DrawerProps) {
  return <Sheet open={open} onOpenChange={onOpenChange}>{children}</Sheet>;
}
 
export const DrawerHeader = SheetHeader;
export const DrawerTitle = SheetTitle;
export const DrawerDescription = SheetDescription;
export const DrawerContent = SheetContent;
export const DrawerFooter = SheetFooter;
