import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { TrainingActivity, CustomWorkoutType } from '@/lib/types';

interface DayEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  activities: TrainingActivity[];
  notes: string;
  workoutTypes: CustomWorkoutType[];
  onSave: (activities: TrainingActivity[], notes: string) => void;
  onAddCustomWorkout: (workout: CustomWorkoutType) => void;
}

export function DayEditor({
  open,
  onOpenChange,
  date,
  activities,
  notes,
  workoutTypes,
  onSave,
  onAddCustomWorkout
}: DayEditorProps) {
  const [editActivities, setEditActivities] = useState<TrainingActivity[]>(activities);
  const [editNotes, setEditNotes] = useState(notes);
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutCategory, setNewWorkoutCategory] = useState<'cardio' | 'strength' | 'gym' | 'other'>('other');

  const getActivityTypeLabel = (typeValue: string) => {
    const typeMap: Record<string, string> = {
      'easy-run': 'Easy Run',
      'long-run': 'Long Run',
      'tempo-run': 'Tempo Run',
      'rest-day': 'Rest Day',
      'gym': 'Gym'
    };
    
    if (typeMap[typeValue]) {
      return typeMap[typeValue];
    }
    
    const customWorkout = workoutTypes.find(w => w.id === typeValue);
    return customWorkout?.name || typeValue;
  };

  const handleAddActivity = () => {
    const newActivity: TrainingActivity = {
      id: `activity-${Date.now()}`,
      activity: 'New Activity',
      description: '',
      type: 'custom',
      isCustom: true
    };
    setEditActivities([...editActivities, newActivity]);
  };

  const handleRemoveActivity = (id: string) => {
    setEditActivities(editActivities.filter(a => a.id !== id));
  };

  const handleUpdateActivity = (id: string, field: string, value: any) => {
    setEditActivities(editActivities.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleAddCustomWorkout = () => {
    if (!newWorkoutName.trim()) return;

    const newWorkout: CustomWorkoutType = {
      id: `custom-${Date.now()}`,
      name: newWorkoutName,
      category: newWorkoutCategory,
      createdAt: new Date().toISOString()
    };

    onAddCustomWorkout(newWorkout);
    setNewWorkoutName('');
    setNewWorkoutCategory('other');
    setShowNewWorkout(false);
  };

  const handleSave = () => {
    onSave(editActivities, editNotes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Day: {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activities Section */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Activities</h3>
            <div className="space-y-3">
              {editActivities.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Activity name"
                      value={activity.activity}
                      onChange={(e) => handleUpdateActivity(activity.id, 'activity', e.target.value)}
                      className="font-semibold"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveActivity(activity.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={activity.description}
                    onChange={(e) => handleUpdateActivity(activity.id, 'description', e.target.value)}
                    className="mb-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Distance (km)"
                      value={activity.distanceKm || ''}
                      onChange={(e) => handleUpdateActivity(activity.id, 'distanceKm', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <Select
                      value={activity.type || 'easy-run'}
                      onValueChange={(value) => handleUpdateActivity(activity.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy-run">Easy Run</SelectItem>
                        <SelectItem value="long-run">Long Run</SelectItem>
                        <SelectItem value="tempo-run">Tempo Run</SelectItem>
                        <SelectItem value="rest-day">Rest Day</SelectItem>
                        <SelectItem value="gym">Gym</SelectItem>
                        {workoutTypes.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id}>
                            {workout.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-3 gap-2"
              onClick={handleAddActivity}
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </Button>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Day Notes</h3>
            <Textarea
              placeholder="Add notes about this training day..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Custom Workout Types Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Custom Workout Types</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewWorkout(!showNewWorkout)}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Type
              </Button>
            </div>

            {showNewWorkout && (
              <Card className="p-4 mb-3">
                <div className="space-y-3">
                  <Input
                    placeholder="Workout type name (e.g., Yoga, Pilates, Swimming)"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                  />
                  <Select
                    value={newWorkoutCategory}
                    onValueChange={(value: any) => setNewWorkoutCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCustomWorkout}
                      className="flex-1"
                    >
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewWorkout(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {workoutTypes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {workoutTypes.map((workout) => (
                  <Card key={workout.id} className="p-3 text-sm">
                    <div className="font-medium">{workout.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{workout.category}</div>
                  </Card>
                ))}
              </div>
            )}
            {workoutTypes.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No custom workout types yet. Create one to get started!</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
