package ar.com.mindtrips.objects;

import org.json.JSONException;
import org.json.JSONObject;

public class Ratings {
	public String airlineId = null;
	public Integer flightNumber = null;
	public Integer friendlinessRating = 1;
	public Integer foodRating = 1;
	public Integer punctualityRating = 1;
	public Integer mileageProgramRating = 1;
	public Integer comfortRating = 1;
	public Integer qualityPriceRating = 1;
	public Boolean yesRecommend = true;
	public String comment = null;
	
	public String toJson(){
	    JSONObject jsonObject= new JSONObject();
	    try {
	        jsonObject.put("airlineId", airlineId);
	        jsonObject.put("flightNumber", flightNumber);
	        jsonObject.put("friendlinessRating", friendlinessRating);
	        jsonObject.put("foodRating", foodRating);
	        jsonObject.put("punctualityRating", punctualityRating);
	        jsonObject.put("mileageProgramRating", mileageProgramRating);
	        jsonObject.put("comfortRating", comfortRating);
	        jsonObject.put("qualityPriceRating", qualityPriceRating);
	        jsonObject.put("yesRecommend", yesRecommend);
	        if(comment != null){
	        	jsonObject.put("comments", comment);
	        }else{
	        	jsonObject.put("comments", "");
	        }
	        return jsonObject.toString();
	    } catch (JSONException e) {
	        // TODO Auto-generated catch block
	        e.printStackTrace();
	        return "";
	    }
	}
}
