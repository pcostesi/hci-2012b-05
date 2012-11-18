package ar.com.mindtrips;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;


public class DealsActivity extends Activity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_deals);

	    // Get the intent, verify the action and get the query
	    Intent intent = getIntent();
	    if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
	      String query = intent.getStringExtra(SearchManager.QUERY);
	      //doMySearch(query);
	      System.out.println("YAY F UCKERS");
	    }
	}
}
