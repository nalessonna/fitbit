module PeriodFilterable
  extend ActiveSupport::Concern

  def filter_by_period(scope, column: "date")
    case params[:period]
    when "month"   then scope.where("#{column} >= ?", 1.month.ago.to_date)
    when "3months" then scope.where("#{column} >= ?", 3.months.ago.to_date)
    when "6months" then scope.where("#{column} >= ?", 6.months.ago.to_date)
    when "year"    then scope.where("#{column} >= ?", 1.year.ago.to_date)
    else scope
    end
  end
end
