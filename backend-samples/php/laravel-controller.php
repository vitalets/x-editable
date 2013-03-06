<?php

class Serie_Controller extends Base_Controller
{
    public function post_quick_update()
    {
        $inputs = Input::all();

        $serie = Serie::find($inputs['pk']);

        $serie->$inputs['name'] = $inputs['value'];

        return $serie->save();
    }
}

/*
The blade template.
<span class='video-editable' data-emptytext='Click to add YouTube Video' data-type='text' data-url='{{ url('serie/quick_update') }}' data-pk="{{ $serie->id }}" data-name='video'>
    {{ nl2br($serie->video) }}
</span>
*/
