import { format, parseISO, isToday } from 'date-fns';

interface ScheduleItemProps {
  day: any;
  onEdit: (date: string) => void;
  onToggleCompletion: (date: string) => void;
}

export default function ScheduleItem({ day, onEdit, onToggleCompletion }: ScheduleItemProps) {
  const date = parseISO(day.date);
  const isTodayDate = isToday(date);
  const bgClass = isTodayDate ? 'bg-primary/10 border-2 border-primary' : 'bg-muted hover:bg-muted/80';
  const opacityClass = day.isCompleted ? 'opacity-60' : '';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${bgClass} ${opacityClass}`}>
      <div onClick={() => onToggleCompletion(day.date)} className="flex-1">
        <div className="flex items-center gap-4">
          <div className="text-center w-12">
            <div className="text-xs font-semibold text-muted-foreground">{format(date, 'EEE')}</div>
            <div className="text-xl font-bold text-foreground">{format(date, 'd')}</div>
          </div>
          <div>
            {day.activities.map((activity: any, idx: number) => (
              <div key={activity.id || idx}>
                <div className="font-semibold text-foreground text-sm">{activity.activity}</div>
                {activity.distanceKm && <div className="text-xs text-primary">{activity.distanceKm} km</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(day.date);
          }}
          className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
        >
          Edit
        </button>
        {day.isCompleted && <div className="text-2xl text-primary">✓</div>}
      </div>
    </div>
  );
}
