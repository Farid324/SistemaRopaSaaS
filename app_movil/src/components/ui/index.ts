// app_movil/src/components/ui/index.ts

// ── Core ──
export { Button } from './forms/button';
export { Input } from './forms/input';
export { Textarea } from './forms/textarea';
export { Label } from './forms/label';
export { Select } from './forms/select';

// ── Layout ──
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './display/card';
export { Separator } from './layout/separator';
export { AspectRatio } from './layout/aspect-ratio';
export { ScrollArea } from './layout/scroll-area';

// ── Feedback ──
export { Badge } from './display/badge';
export { Alert, AlertTitle, AlertDescription } from './feedback/alert';
export { AlertDialog } from './overlays/alert-dialog';
export { Skeleton } from './feedback/skeleton';
export { Progress } from './feedback/progress';
export { ToastProvider, useToast } from './feedback/sonner';

// ── Data Display ──
export { Avatar } from './display/avatar';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from './display/table';
export { ChartContainer, SimpleBarChart } from './display/chart';

// ── Controls ──
export { Switch } from './forms/switch';
export { Checkbox } from './forms/checkbox';
export { RadioGroup, RadioGroupItem } from './forms/radio-group';
export { Slider } from './forms/slider';
export { Toggle } from './forms/toggle';
export { ToggleGroup, ToggleGroupItem } from './forms/toggle-group';

// ── Overlays ──
export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './overlays/dialog';
export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetContent, SheetFooter } from './overlays/sheet';
export { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from './overlays/drawer';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from './overlays/dropdown-menu';
export { Popover, PopoverTrigger, PopoverContent } from './overlays/popover';

// ── Navigation ──
export { Tabs, TabsList, TabsTrigger, TabsContent } from './navigation/tabs';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './display/accordion';
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './display/collapsible';
export { Pagination } from './navigation/pagination';

// ── Specialized ──
export { Calendar } from './display/calendar';
export { Carousel, CarouselItem } from './display/carousel';
export { InputOTP } from './forms/input-otp';