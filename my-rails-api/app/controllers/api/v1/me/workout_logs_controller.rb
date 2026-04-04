class Api::V1::Me::WorkoutLogsController < ApplicationController
  before_action :set_exercise
  before_action :set_log, only: [ :update, :destroy ]

  def show
    log = @exercise.workout_logs.find_by(date: params[:date])
    render json: workout_log_json(log)
  end

  def update
    if params[:sets].empty?
      render json: { error: "setsは1件以上必要です" }, status: :unprocessable_content
      return
    end

    @log.workout_sets.destroy_all
    params[:sets].each do |set|
      @log.workout_sets.create!(
        set_number: set[:set_number],
        weight:     set[:weight],
        reps:       set[:reps]
      )
    end
    render json: workout_log_json(@log.reload)
  end

  def destroy
    @log.destroy
    head :no_content
  end

  private

  def set_exercise
    @exercise = current_user.exercises.find_by!(id: params[:exercise_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Not found" }, status: :not_found
  end

  def set_log
    @log = @exercise.workout_logs.find_or_create_by!(date: params[:date])
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
