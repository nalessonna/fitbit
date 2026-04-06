class Api::V1::Users::ExercisesController < Api::V1::Users::BaseController
  include PeriodFilterable

  before_action :set_body_part,  only: [ :index ]
  before_action :set_exercise,   only: [ :volume, :one_rm_history ]

  def index
    exercises = @body_part.exercises.order(:name)
    render json: exercises.map { |e| exercise_json(e) }
  end

  def volume
    sets = filter_by_period(
      WorkoutSet.joins(:workout_log).where(workout_logs: { exercise_id: @exercise.id }),
      column: "workout_logs.date"
    )

    result = sets
      .group("workout_logs.date")
      .sum("workout_sets.weight * workout_sets.reps")
      .map { |date, vol| { date: date.to_s, volume: vol.to_f } }
      .sort_by { |e| e[:date] }

    render json: result
  end

  def one_rm_history
    sets = filter_by_period(
      WorkoutSet.joins(:workout_log).where(workout_logs: { exercise_id: @exercise.id }),
      column: "workout_logs.date"
    )

    result = sets
      .group("workout_logs.date")
      .maximum("workout_sets.weight * (1 + workout_sets.reps * 1.0 / 30.0)")
      .map { |date, one_rm| { date: date.to_s, one_rm: one_rm.to_f } }
      .sort_by { |e| e[:date] }

    render json: result
  end

  private

  def set_body_part
    @body_part = @target_user.body_parts.find_by(id: params[:body_part_id])
    render json: { error: "Not found" }, status: :not_found if @body_part.nil?
  end

  def set_exercise
    @exercise = @target_user.exercises.find_by(id: params[:id])
    render json: { error: "Not found" }, status: :not_found if @exercise.nil?
  end

  def exercise_json(exercise)
    {
      id:           exercise.id,
      name:         exercise.name,
      body_part_id: exercise.body_part_id,
      body_part:    exercise.body_part.name
    }
  end
end
