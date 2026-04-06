class Api::V1::Users::BodyPartsController < Api::V1::Users::BaseController
  include PeriodFilterable

  before_action :set_body_part, only: [ :volume ]

  def index
    body_parts = @target_user.body_parts.order(:name)
    render json: body_parts.map { |bp| body_part_json(bp) }
  end

  def volume
    sets = filter_by_period(
      WorkoutSet.joins(workout_log: :exercise).where(exercises: { body_part_id: @body_part.id }),
      column: "workout_logs.date"
    )

    result = sets
      .group("workout_logs.date")
      .sum("workout_sets.weight * workout_sets.reps")
      .map { |date, vol| { date: date.to_s, volume: vol.to_f } }
      .sort_by { |e| e[:date] }

    render json: result
  end

  private

  def set_body_part
    @body_part = @target_user.body_parts.find_by(id: params[:id])
    render json: { error: "Not found" }, status: :not_found if @body_part.nil?
  end

  def body_part_json(body_part)
    { id: body_part.id, name: body_part.name }
  end
end
