class Api::V1::Users::WorkoutLogsController < Api::V1::Users::BaseController
  before_action :set_exercise

  def show
    log = @exercise.workout_logs.find_by(date: params[:date])
    render json: workout_log_json(log)
  end

  private

  def set_exercise
    @exercise = @target_user.exercises.find_by(id: params[:exercise_id])
    render json: { error: "Not found" }, status: :not_found if @exercise.nil?
  end

  def workout_log_json(log)
    return { date: params[:date], sets: [] } if log.nil?

    {
      date: log.date,
      sets: log.workout_sets.order(:set_number).map { |s|
        { set_number: s.set_number, weight: s.weight.to_f, reps: s.reps }
      }
    }
  end
end
