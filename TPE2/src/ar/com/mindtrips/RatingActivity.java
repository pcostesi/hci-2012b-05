package ar.com.mindtrips;

import org.json.JSONObject;
import org.json.JSONStringer;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.EditText;
import android.widget.RatingBar;
import android.widget.Switch;
import ar.com.mindtrips.R.id;
import ar.com.mindtrips.objects.Ratings;
import ar.edu.itba.hci2012.api.RequestReceiver;
import ar.edu.itba.hci2012.api.intent.Post;
import ar.edu.itba.hci2012.api.intent.QueryIntent;

public class RatingActivity extends Activity {
	
	private RatingBar friendlinessRating;
	private RatingBar foodRating;
	private RatingBar punctualityRating;
	private RatingBar mileageProgramRating;
	private RatingBar comfortRating;
	private RatingBar qualityPriceRating;
	private EditText comment;
	private Button finish;
	private Switch recommend;
	private Ratings data = new Ratings();
	
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_rating);
		setListeners();
		Bundle extras = getIntent().getExtras();
		data.airlineId = extras.getString("airline");
		data.flightNumber = (Integer.parseInt(extras.getString("flightId")));
	}	

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.activity_rating, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle item selection
		switch (item.getItemId()) {
		case R.id.main:
			finish();
			return true;
		default:
			return super.onOptionsItemSelected(item);
		}
	}
	
	public void sendReview(){
		RequestReceiver reciver = new RequestReceiver() {

			@Override
			public void onSuccess(JSONObject json) {
				System.out.println(json);
				
			}
			public void onError(String msg, int code) {
				System.out.println(msg + " " + code);
			}
		};
		Intent intent = new Post(reciver, "Review", "ReviewAirline", data.toJson());
		startService(intent);
		 
	}
	
	public void setListeners(){
		friendlinessRating = (RatingBar) findViewById(R.id.friendlinessRating);
		foodRating = (RatingBar) findViewById(R.id.foodRating);
		punctualityRating = (RatingBar) findViewById(R.id.punctualityRating);
		mileageProgramRating = (RatingBar) findViewById(R.id.mileageProgramRating);
		comfortRating = (RatingBar) findViewById(R.id.comfortRating);
		qualityPriceRating = (RatingBar) findViewById(R.id.qualityPriceRating);
		comment = (EditText) findViewById(R.id.comment);
		finish = (Button) findViewById(R.id.send);
		recommend = (Switch) findViewById(R.id.recommend);
		
		recommend.setOnCheckedChangeListener(new OnCheckedChangeListener(){
			@Override
			public void onCheckedChanged(CompoundButton arg0, boolean arg1) {
				data.yesRecommend = arg1;
			}
			
		});
		finish.setOnClickListener(new Button.OnClickListener(){

			@Override
			public void onClick(View arg0) {
				data.comment = comment.getText().toString();
				sendReview();
				
			}
			
		});
		friendlinessRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {	
				data.friendlinessRating = ((int)(rating*2))+1;
				
			}
		});	
		foodRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {	
				data.foodRating = ((int)(rating*2))+1;
			}
		});	
		punctualityRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {	
				data.punctualityRating = ((int)(rating*2))+1;
			}
		});	
		mileageProgramRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {
				data.mileageProgramRating = ((int)(rating*2))+1;
			}
		});	
		comfortRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {
				data.comfortRating = ((int)(rating*2))+1;
			}
		});	
		qualityPriceRating.setOnRatingBarChangeListener(new RatingBar.OnRatingBarChangeListener() {
			public void onRatingChanged(RatingBar ratingBar, float rating,
					boolean fromUser) {
				data.qualityPriceRating = ((int)(rating*2))+1;
			}
		});
	}

}
