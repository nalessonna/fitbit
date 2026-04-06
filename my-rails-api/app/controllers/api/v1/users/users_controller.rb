class Api::V1::Users::UsersController < Api::V1::Users::BaseController
  include PeriodFilterable

  def calendar
    if params[:year].blank? || params[:month].blank?
      render json: { error: "year と month は必須です" }, status: :unprocessable_content
      return
    end

    logs = WorkoutLog
      .joins(:exercise)
      .where(exercises: { user_id: @target_user.id })
      .where("EXTRACT(YEAR FROM date) = ? AND EXTRACT(MONTH FROM date) = ?", params[:year].to_i, params[:month].to_i)
      .includes(:exercise)
      .order(:date)

    result = logs.group_by(&:date).map do |date, day_logs|
      { date: date.to_s, exercise_names: day_logs.map { |l| l.exercise.name } }
    end

    render json: result
  end

  def volume
    sets = filter_by_period(
      WorkoutSet.joins(workout_log: :exercise).where(exercises: { user_id: @target_user.id }),
      column: "workout_logs.date"
    )

    result = sets
      .group("workout_logs.date")
      .sum("workout_sets.weight * workout_sets.reps")
      .map { |date, vol| { date: date.to_s, volume: vol.to_f } }
      .sort_by { |e| e[:date] }

    render json: result
  end
end
