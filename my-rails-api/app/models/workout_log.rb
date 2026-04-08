class WorkoutLog < ApplicationRecord
  belongs_to :exercise
  has_many :workout_sets, dependent: :destroy

  validates :date, presence: true, uniqueness: { scope: :exercise_id }

  def self.calendar_data(user_id, year, month)
    logs = joins(:exercise)
      .where(exercises: { user_id: user_id })
      .where("EXTRACT(YEAR FROM date) = ? AND EXTRACT(MONTH FROM date) = ?", year, month)
      .includes(:exercise, :workout_sets)
      .order(:date)

    logs.group_by(&:date).map do |date, day_logs|
      {
        date:           date.to_s,
        exercise_names: day_logs.map { |l| l.exercise.name },
        exercises:      day_logs.map do |l|
          {
            id:           l.exercise.id,
            name:         l.exercise.name,
            body_part_id: l.exercise.body_part_id,
            sets: l.workout_sets.sort_by(&:set_number).map do |s|
              { set_number: s.set_number, weight: s.weight.to_f, reps: s.reps }
            end
          }
        end
      }
    end
  end
end
